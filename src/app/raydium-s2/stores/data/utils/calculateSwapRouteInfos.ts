import { Numberish, assert, hasProperty, isDateAfter, shakeNil } from '@edsolater/fnkit'
import {
  AmmV3PoolInfo,
  ApiPoolInfoItem,
  PoolType,
  ReturnTypeFetchMultipleInfo,
  ReturnTypeGetAllRouteComputeAmountOut,
  TradeV2,
  ComputeAmountOutAmmLayout,
  ComputeAmountOutRouteLayout,
} from '@raydium-io/raydium-sdk'
import { getConnection } from '../../../utils/common/getConnection'
import toPubString from '../../../utils/dataStructures/Publickey'
import { toPercent } from '../../../utils/dataStructures/Percent'
import { Token, toSDKToken } from '../../../utils/dataStructures/Token'
import { TokenAmount, deUITokenAmount } from '../../../utils/dataStructures/TokenAmount'
import { fetchAmmPoolInfo } from './fetchSwapAmmInfo'
import { sdkParseCLMMPoolInfo } from './sdkParseCLMMPoolInfo'
import { sdkParseSwapAmmInfo } from './sdkParseSwapAmmInfo'
import { flatSDKReturnedInfo } from '../../../utils/sdkTools/flatSDKReturnedInfo'
import { makeTaskAbortable } from '../../../../../packages/fnkit/makeTaskAbortable'
import { inNextMainLoop } from '../../../../../packages/fnkit/inNextMainLoop'
import { Mint } from '../../../utils/dataStructures/type'

export type CalculateSwapRouteInfosParams = Parameters<typeof calculateSwapRouteInfos>[0]
export type CalculateSwapRouteInfosResult = Awaited<ReturnType<typeof calculateSwapRouteInfos>['result']>

type CacheKey = `${Mint}-${Mint}`

export type SDKBestResult = ComputeAmountOutAmmLayout | ComputeAmountOutRouteLayout

// TODO: it should be a max length cache map
interface SwapBestResultItem {
  params: {
    /** there will be only baseAmount or quoteAmount */
    input: Token
    output: Token
    inputAmount: TokenAmount
    slippageTolerance: Numberish
    rpcUrl: string
  }
  sdkBestResult: SDKBestResult
  timestamp: number
}

const swapBestResultCache = new Map<
  CacheKey,
  // TODO: it should be a max length cache map
  SwapBestResultItem
>()

let neariestSwapBestResultCache: SwapBestResultItem | undefined = undefined

export function getBestCalcResultCache() {
  return neariestSwapBestResultCache
}
/**
 * swap core calculation algorithm
 */
export function calculateSwapRouteInfos({
  rpcUrl = 'https://rpc.asdf1234.win',
  slippageTolerance = 0.05,
  input,
  output,
  inputAmount,
}: {
  rpcUrl?: string
  slippageTolerance?: Numberish
  input: Token
  output: Token
  inputAmount: TokenAmount
}) {
  return makeTaskAbortable((canContinue) => {
    const fetchedAmmPoolInfoPromise = fetchAmmPoolInfo()
    const canContinueAsyncChecker = <T>(i: T): T => {
      assert(canContinue(), 'task aborted')
      return i
    }
    const ammV3Promise = fetchedAmmPoolInfoPromise
      .then(inNextMainLoop(canContinueAsyncChecker))
      .then((i) => i.ammV3)
      .then((ammV3) => {
        assert(ammV3, 'ammV3 api must be loaded')
        return ammV3
      })
    const apiPoolListPromise = fetchedAmmPoolInfoPromise
      .then(inNextMainLoop(canContinueAsyncChecker))
      .then((i) => i.liquidity)
      .then((apiPoolList) => {
        assert(apiPoolList, 'liquidity api must be loaded')
        return apiPoolList
      })
    const connection = getConnection(rpcUrl)
    const chainTime = Date.now() / 1000

    const sdkParsedAmmV3PoolInfoPromise = ammV3Promise
      .then(inNextMainLoop(canContinueAsyncChecker))
      .then((ammV3) => sdkParseCLMMPoolInfo({ connection, apiAmmPools: ammV3 }))

    const sdkParsedSwapAmmInfo = Promise.all([sdkParsedAmmV3PoolInfoPromise, apiPoolListPromise])
      .then(inNextMainLoop(canContinueAsyncChecker))
      .then(([sdkParsedAmmV3PoolInfo, apiPoolList]) =>
        sdkParseSwapAmmInfo({
          connection,
          inputMint: input.mint,
          outputMint: output.mint,
          apiPoolList: apiPoolList,
          sdkParsedAmmV3PoolInfo: sdkParsedAmmV3PoolInfo,
        }),
      )

    const awaitedSimulateCache = sdkParsedSwapAmmInfo.then((info) => info.poolInfosCache)
    if (!awaitedSimulateCache) return

    const awaitedTickCache = sdkParsedSwapAmmInfo.then((info) => info.tickCache)
    if (!awaitedTickCache) return

    const routeList = sdkParsedSwapAmmInfo
      .then(inNextMainLoop(canContinueAsyncChecker))
      .then(async ({ poolInfosCache, tickCache, routes }) => {
        const [awaitedPoolInfosCache, awaitedTickCache] = await Promise.all([poolInfosCache, tickCache])
        assert(awaitedPoolInfosCache)
        assert(awaitedTickCache)
        return TradeV2.getAllRouteComputeAmountOut({
          directPath: routes.directPath,
          routePathDict: routes.routePathDict,
          simulateCache: awaitedPoolInfosCache,
          tickCache: awaitedTickCache,
          inputTokenAmount: deUITokenAmount(inputAmount),
          outputToken: toSDKToken(output),
          slippage: toPercent(slippageTolerance),
          chainTime,
        })
      })

    const best = Promise.all([routeList, sdkParsedSwapAmmInfo.then((i) => i.poolInfosCache)])
      .then(inNextMainLoop(canContinueAsyncChecker))
      .then(([routeList, poolInfosCache]) => getBestCalcResult(routeList, poolInfosCache, chainTime))

    const swapInfo = Promise.all([routeList, best])
      .then(inNextMainLoop(canContinueAsyncChecker))
      .then(([routeList, best]) => ({
        routeList,
        bestResult: best?.bestResult,
        bestResultStartTimes: best?.bestResultStartTimes,
      }))

    // record swapInfo
    swapInfo.then(({ bestResult: sdkBestResult }) => {
      if (!canContinue()) return
      if (!sdkBestResult) return
      const cacheKey = `${input.mint}-${output.mint}` as CacheKey
      const bestResultItem = {
        params: {
          input,
          output,
          inputAmount,
          slippageTolerance,
          rpcUrl
        },
        sdkBestResult,
        timestamp: Date.now(),
      }
      swapBestResultCache.set(cacheKey, bestResultItem)
      neariestSwapBestResultCache = bestResultItem
    })
    return swapInfo.then((i) => flatSDKReturnedInfo(i))
  })
}

interface BestResultStartTimeInfo {
  ammId: string
  startTime: number
  poolType: PoolType
  poolInfo: BestResultStartTimePoolInfo
}

interface BestResultStartTimePoolInfo {
  rawInfo: AmmV3PoolInfo | ApiPoolInfoItem
  ammId: string
  quoteMint: string
  baseMint: string
}

function getBestCalcResult(
  routeList: ReturnTypeGetAllRouteComputeAmountOut,
  poolInfosCache: ReturnTypeFetchMultipleInfo | undefined,
  chainTime: number,
):
  | {
      bestResult: ReturnTypeGetAllRouteComputeAmountOut[number]
      bestResultStartTimes?: BestResultStartTimeInfo[] /* only when bestResult is not ready */
    }
  | undefined {
  if (!routeList.length) return undefined
  const readyRoutes = routeList.filter((i) => i.poolReady)
  const hasReadyRoutes = Boolean(readyRoutes.length)
  if (hasReadyRoutes) {
    return { bestResult: readyRoutes[0] }
  } else {
    if (!poolInfosCache) return { bestResult: routeList[0] }

    const routeStartTimes = routeList[0].poolKey.map((i) => {
      const ammId = toPubString(i.id)
      const poolAccountInfo = i.version === 6 ? i : poolInfosCache[ammId]
      if (!poolAccountInfo) return undefined
      const startTime = Number(poolAccountInfo.startTime) * 1000
      const isPoolOpen = isDateAfter(chainTime, startTime)
      if (isPoolOpen) return undefined
      return { ammId, startTime, poolType: i, poolInfo: getPoolInfoFromPoolType(i) }
    })

    return { bestResult: routeList[0], bestResultStartTimes: shakeNil(routeStartTimes) }
  }
}

function getPoolInfoFromPoolType(poolType: PoolType): BestResultStartTimeInfo['poolInfo'] {
  return {
    rawInfo: poolType,
    ammId: toPubString(poolType.id),
    baseMint: isAmmV3PoolInfo(poolType) ? toPubString(poolType.mintA.mint) : poolType.baseMint,
    quoteMint: isAmmV3PoolInfo(poolType) ? toPubString(poolType.mintB.mint) : poolType.quoteMint,
  }
}

function isAmmV3PoolInfo(poolType: PoolType): poolType is AmmV3PoolInfo {
  return hasProperty(poolType, 'protocolFeesTokenA')
}
