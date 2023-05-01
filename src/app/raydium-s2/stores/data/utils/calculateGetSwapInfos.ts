import { Numberish, assert, hasProperty, isAfter, shakeNil } from '@edsolater/fnkit'
import {
  AmmV3PoolInfo,
  ApiPoolInfoItem,
  PoolType,
  ReturnTypeFetchMultipleInfo,
  ReturnTypeGetAllRouteComputeAmountOut,
  TradeV2
} from '@raydium-io/raydium-sdk'
import { Connection } from '@solana/web3.js'
import toPubString from '../../../utils/common/pub'
import { toPercent } from '../../../utils/dataStructures/Percent'
import { Token, deUIToken } from '../../../utils/dataStructures/Token'
import { TokenAmount, deUITokenAmount } from '../../../utils/dataStructures/TokenAmount'
import { fetchAmmPoolInfo } from './fetchSwapAmmInfo'
import { sdkParseCLMMPoolInfo } from './sdkParseCLMMPoolInfo'
import { sdkParseSwapAmmInfo } from './sdkParseSwapAmmInfo'

export async function calculateGetSwapInfos({
  connection,
  slippageTolerance,
  input,
  output,
  inputAmount
}: {
  connection: Connection
  slippageTolerance: Numberish
  input: Token
  output: Token
  inputAmount: TokenAmount
}) {
  const { ammV3, liquidity: apiPoolList } = await fetchAmmPoolInfo()
  if (!connection) return
  assert(
    connection,
    "no connection provide. it will default useConnection's connection, but can still appointed by user"
  )
  assert(ammV3, 'ammV3 api must be loaded')
  assert(apiPoolList, 'liquidity api must be loaded')
  const chainTime = Date.now() / 1000

  const sdkParsedAmmV3PoolInfo = await sdkParseCLMMPoolInfo({ connection, apiAmmPools: ammV3 })
  const { routes, poolInfosCache, tickCache } = sdkParseSwapAmmInfo({
    connection,
    inputMint: input.mint,
    outputMint: output.mint,
    apiPoolList: apiPoolList,
    sdkParsedAmmV3PoolInfo: sdkParsedAmmV3PoolInfo
  })

  const awaitedSimulateCache = await poolInfosCache
  if (!awaitedSimulateCache) return

  const awaitedTickCache = await tickCache
  if (!awaitedTickCache) return

  const routeList = TradeV2.getAllRouteComputeAmountOut({
    directPath: routes.directPath,
    routePathDict: routes.routePathDict,
    simulateCache: awaitedSimulateCache,
    tickCache: awaitedTickCache,
    inputTokenAmount: deUITokenAmount(inputAmount),
    outputToken: deUIToken(output),
    slippage: toPercent(slippageTolerance),
    chainTime
  })
  const { bestResult, bestResultStartTimes } = getBestCalcResult(routeList, awaitedSimulateCache, chainTime) ?? {}
  return { routeList, bestResult, bestResultStartTimes }
}

type BestResultStartTimeInfo = {
  ammId: string
  startTime: number
  poolType: PoolType
  poolInfo: BestResultStartTimePoolInfo
}

type BestResultStartTimePoolInfo = {
  rawInfo: AmmV3PoolInfo | ApiPoolInfoItem
  ammId: string
  quoteMint: string
  baseMint: string
}

function getBestCalcResult(
  routeList: ReturnTypeGetAllRouteComputeAmountOut,
  poolInfosCache: ReturnTypeFetchMultipleInfo | undefined,
  chainTime: number
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
      const isPoolOpen = isAfter(chainTime, startTime)
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
    quoteMint: isAmmV3PoolInfo(poolType) ? toPubString(poolType.mintB.mint) : poolType.quoteMint
  }
}

function isAmmV3PoolInfo(poolType: PoolType): poolType is AmmV3PoolInfo {
  return hasProperty(poolType, 'protocolFeesTokenA')
}
