import { createSubscribableFromPromise, listToJSMap, map } from '@edsolater/fnkit'
import { Farm, FarmFetchMultipleInfoParams } from '@raydium-io/raydium-sdk'
import { abortableAsyncTask } from '../../../../packages/fnkit'
import { getConnection } from '../../../utils/common/getConnection'
import toPubString, { toPub } from '../../../utils/dataStructures/Publickey'
import { mul } from '../../../utils/dataStructures/basicMath/operations'
import { slice, toArray, toCollectionObject } from '../../../utils/dataTransmit/itemMethods'
import { jsonInfo2PoolKeys } from '../../../utils/sdkTools/jsonInfo2PoolKeys'
import { FarmInfo } from '../types/farm'
import { fetchFarmJsonInfo } from './fetchFarmJson'
import { fetchLiquidityJson } from './fetchLiquidityJson'
import { fetchPairJsonInfo } from './fetchPairJson'

export type ComposedFarmSYNInfos = Record<string, FarmInfo> | undefined
export type ComposeFarmSYNInfoQuery = {
  owner?: string
  rpcUrl: string
}

/**
 * use LiquidityJson to get
 */
export function composeFarmSYN(query: ComposeFarmSYNInfoQuery) {
  return abortableAsyncTask<ComposedFarmSYNInfos>(async ({ resolve, aborted }) => {
    const farmJsonPromise = fetchFarmJsonInfo()
    const liquidityJsonPromise = fetchLiquidityJson()
    const pairJsonInfoPromise = fetchPairJsonInfo()
    const fetchedAPIPromise = Promise.all([farmJsonPromise, liquidityJsonPromise, pairJsonInfoPromise])
    const farmSDKPromise = farmJsonPromise.then((farmJsonInfos) => {
      if (!farmJsonInfos) return
      const paramOptions: FarmFetchMultipleInfoParams = {
        connection: getConnection(query.rpcUrl),
        pools: toArray(farmJsonInfos).map(jsonInfo2PoolKeys),
        owner: toPub(query.owner),
        config: { batchRequest: true, commitment: 'confirmed' },
        chainTime: Date.now() / 1000, // TEMP for not create chainTime system yet
      }
      return Farm.fetchMultipleInfoAndUpdate(paramOptions)
    })

    const combinedSubscribable = createSubscribableFromPromise(Promise.all([fetchedAPIPromise, farmSDKPromise]))

    combinedSubscribable.subscribe((v) => {
      const [[farmJsons, liquidityJsons, pairJsons] = [], farmSDKs] = v
      if (aborted()) return
      const farmSYN = hydrateFarmSYN({ farmJsons, liquidityJsons, pairJsons, farmSDKs })
      resolve(farmSYN)
    })
  })
}

function hydrateFarmSYN({
  farmJsons,
  farmSDKs,
  liquidityJsons,
  pairJsons,
}: {
  farmJsons?: Awaited<ReturnType<typeof fetchFarmJsonInfo>>
  farmSDKs?: Awaited<ReturnType<(typeof Farm)['fetchMultipleInfoAndUpdate']>>
  liquidityJsons?: Awaited<ReturnType<typeof fetchLiquidityJson>>
  pairJsons?: Awaited<ReturnType<typeof fetchPairJsonInfo>>
}) {
  if (!farmJsons) return
  const liquidityJsonLpMintMap = liquidityJsons && listToJSMap(liquidityJsons, (i) => i.lpMint)
  const pairJsonAmmIdMap = pairJsons && listToJSMap(pairJsons, (i) => i.ammId)
  const pairJsonLpMintMap = pairJsons && listToJSMap(pairJsons, (i) => i.lpMint)

  const rawList = map(farmJsons, (farmJson) => {
    const farmSDK = farmSDKs?.[toPubString(farmJson.id)]
    const ammId = liquidityJsonLpMintMap?.get(farmJson.lpMint)?.id
    const pairJson = ammId ? pairJsonAmmIdMap?.get(ammId) : undefined
    const lpPrice = pairJsonLpMintMap?.get(farmJson.lpMint)?.lpPrice ?? undefined
    const tvl = lpPrice != null && farmSDK ? mul(String(farmSDK.lpVault.amount), lpPrice) : undefined
    const apr =
      pairJson &&
      ({
        '24h': pairJson.apr24h,
        '30d': pairJson.apr30d,
        '7d': pairJson.apr7d,
      } as FarmInfo['rewards'][number]['apr'])
    return {
      hasLoad: [farmSDK ? 'sdk' : undefined, farmSDK?.ledger ? 'ledger' : undefined, 'api'],

      id: farmJson.id,

      name: farmJson.symbol,
      base: farmJson.baseMint,
      quote: farmJson.quoteMint,
      category: farmJson.category,
      tvl,
      userStakedLpAmount: farmSDK?.ledger
        ? {
            token: farmJson.lpMint,
            amount: farmSDK.ledger.deposited,
          }
        : undefined,
      rewards: farmJson.rewardInfos.map((rewardJson, idx) => {
        const rewardSDK = farmSDK?.state.rewardInfos.at(idx)
        return {
          token: rewardJson.rewardMint,
          userPendingReward: farmSDK?.wrapped?.pendingRewards.at(idx)
            ? {
                token: rewardJson.rewardMint,
                amount: farmSDK.wrapped.pendingRewards.at(idx),
              }
            : undefined,
          apr,
          farmVersion: farmJson.version,
          type: rewardJson.rewardType,
          perSecond: rewardJson.rewardPerSecond,
          openTime: rewardJson.rewardOpenTime && new Date(rewardJson.rewardOpenTime * 1000),
          endTime: rewardJson.rewardEndTime && new Date(rewardJson.rewardEndTime * 1000),
        } as FarmInfo['rewards'][number]
      }),
    } as FarmInfo
  })

  const indexAccessList = slice(
    toCollectionObject(rawList, (i) => i.id),
    20,
  )
  return indexAccessList
}
