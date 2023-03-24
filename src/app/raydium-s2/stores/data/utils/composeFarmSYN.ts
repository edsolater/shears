import { map } from '@edsolater/fnkit'
import { Farm, FarmFetchMultipleInfoParams } from '@raydium-io/raydium-sdk'
import { createAbortableAsyncTask } from '../../../../../packages/fnkit/createAbortableAsyncTask'
import { IndexAccessList } from '../../../../../packages/fnkit/customizedClasses/IndexAccessList'
import { Subscribable } from '../../../../../packages/fnkit/customizedClasses/Subscribable'
import { getConnection } from '../../../utils/common/getConnection'
import toPubString, { toPub } from '../../../utils/common/pub'
import { mul } from '../../../utils/dataStructures/basicMath/operations'
import { jsonInfo2PoolKeys } from '../../../utils/sdkTools/jsonInfo2PoolKeys'
import { fetchLiquidityJson } from '../../apiInfos/fetchLiquidityJson'
import { fetchPairJsonInfo } from './fetchPairJson'
import { DataStore } from '../store'
import { FarmSYNInfo } from '../farmType'
import { fetchFarmJsonInfo } from './fetchFarmJson'

/**
 * use LiquidityJson to get
 */
export function composeFarmSYN(payload: { owner?: string; rpcUrl: string }) {
  return createAbortableAsyncTask<DataStore['farmInfos']>(async ({ resolve, aborted }) => {
    const farmJsonPromise = fetchFarmJsonInfo()
    const liquidityJsonPromise = fetchLiquidityJson()
    const pairJsonInfoPromise = fetchPairJsonInfo()
    const fetchedAPIPromise = Promise.all([farmJsonPromise, liquidityJsonPromise, pairJsonInfoPromise])
    const farmSDKPromise = farmJsonPromise.then((farmJsonInfos) => {
      if (!farmJsonInfos) return
      const paramOptions: FarmFetchMultipleInfoParams = {
        connection: getConnection(payload.rpcUrl),
        pools: farmJsonInfos.toArray().map(jsonInfo2PoolKeys),
        owner: toPub(payload.owner),
        config: { batchRequest: true, commitment: 'confirmed' }
      }
      return Farm.fetchMultipleInfoAndUpdate(paramOptions)
    })

    Subscribable.fromPromises([fetchedAPIPromise, farmSDKPromise]).subscribe(
      ([[farmJsons, liquidityJsons, pairJsons] = [], farmSDKs]) => {
        if (aborted()) return
        const farmSYN = hydrateFarmSYN({ farmJsons, liquidityJsons, pairJsons, farmSDKs })
        resolve(farmSYN)
      }
    )
  })
}

function hydrateFarmSYN({
  farmJsons,
  farmSDKs,
  liquidityJsons,
  pairJsons
}: {
  farmJsons?: Awaited<ReturnType<typeof fetchFarmJsonInfo>>
  farmSDKs?: Awaited<ReturnType<(typeof Farm)['fetchMultipleInfoAndUpdate']>>
  liquidityJsons?: Awaited<ReturnType<typeof fetchLiquidityJson>>
  pairJsons?: Awaited<ReturnType<typeof fetchPairJsonInfo>>
}) {
  if (!farmJsons) return
  const rawList = map(farmJsons.toArray(), (farmJson) => {
    const farmSDK = farmSDKs?.[toPubString(farmJson.id)]
    const ammId = liquidityJsons?.query(farmJson.lpMint, 'lpMint')?.id
    const pairJson = ammId ? pairJsons?.get(ammId) : undefined
    const lpPrice = pairJsons?.query(farmJson.lpMint, 'lpMint')?.lpPrice ?? undefined
    const tvl = lpPrice != null && farmSDK ? mul(String(farmSDK.lpVault.amount), lpPrice) : undefined
    const apr =
      pairJson &&
      ({
        '24h': pairJson.apr24h,
        '30d': pairJson.apr30d,
        '7d': pairJson.apr7d
      } as FarmSYNInfo['rewards'][number]['apr'])
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
            amount: farmSDK.ledger.deposited
          }
        : undefined,
      rewards: farmJson.rewardInfos.map((rewardJson, idx) => {
        const rewardSDK = farmSDK?.state.rewardInfos.at(idx)
        return {
          token: rewardJson.rewardMint,
          userPendingReward: farmSDK?.wrapped?.pendingRewards.at(idx)
            ? {
                token: rewardJson.rewardMint,
                amount: farmSDK.wrapped.pendingRewards.at(idx)
              }
            : undefined,
          apr,
          farmVersion: farmJson.version,
          type: rewardJson.rewardType,
          perSecond: rewardJson.rewardPerSecond,
          openTime: rewardJson.rewardOpenTime && new Date(rewardJson.rewardOpenTime * 1000),
          endTime: rewardJson.rewardEndTime && new Date(rewardJson.rewardEndTime * 1000)
        } as FarmSYNInfo['rewards'][number]
      })
    } as FarmSYNInfo
  })

  const indexAccessList = new IndexAccessList(rawList.slice(0, 20), 'id')
  return indexAccessList
}
