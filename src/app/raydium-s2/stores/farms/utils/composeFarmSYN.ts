import { map } from '@edsolater/fnkit'
import { Farm, FarmFetchMultipleInfoParams, FarmFetchMultipleInfoReturn } from '@raydium-io/raydium-sdk'
import { composePromises } from '../../../../../packages/fnkit/composePromises'
import { createAbortableAsyncTask } from '../../../../../packages/fnkit/createAbortableAsyncTask'
import { getConnection } from '../../../utils/common/getConnection'
import toPubString, { toPub } from '../../../utils/common/pub'
import { mul } from '../../../utils/dataStructures/basicMath/operations'
import { jsonInfo2PoolKeys } from '../../../utils/sdkTools/jsonInfo2PoolKeys'
import { fetchLiquidityJson } from '../../apiInfos/fetchLiquidityJson'
import { fetchPairJsonInfo } from '../../pairs/utils/fetchPairJson'
import { FarmStore } from '../store'
import { FarmSYNInfo } from '../type'
import { fetchFarmJsonInfo } from './fetchFarmJson'

/**
 * use LiquidityJson to get
 */
export function composeFarmSYN(payload: { owner: string; rpcUrl: string }) {
  return createAbortableAsyncTask<FarmStore['farmSYNInfos']>(async ({ resolve, aborted }) => {
    const fetchedAPIPromise = Promise.all([fetchFarmJsonInfo(), fetchLiquidityJson(), fetchPairJsonInfo()])

    const farmSDKPromise = fetchedAPIPromise.then(([farmJsonInfos]) => {
      const paramOptions: FarmFetchMultipleInfoParams = {
        connection: getConnection(payload.rpcUrl),
        pools: [...farmJsonInfos.values()].map(jsonInfo2PoolKeys),
        owner: toPub(payload.owner),
        config: { commitment: 'confirmed' }
      }
      return Farm.fetchMultipleInfoAndUpdate(paramOptions)
    })
    const allPromise = composePromises(fetchedAPIPromise, farmSDKPromise)

    fetchedAPIPromise.then(([farmJsons, liquidityJsons, pairJsons]) => {
      if (aborted()) return
      const farmSYN = hydrateFarmSYN({ farmJsons, liquidityJsons, pairJsons })
      if (!farmSYN) return
      resolve(farmSYN)
    })

    allPromise.then(([farmJsons, liquidityJsons, pairJsons, farmSDKs]) => {
      if (aborted()) return
      const farmSYN = hydrateFarmSYN({ farmJsons, liquidityJsons, pairJsons, farmSDKs })
      if (!farmSYN) return
      resolve(farmSYN)
    })
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
  if (!farmJsons || !liquidityJsons || !pairJsons) return
  return map(farmJsons, (jsonInfo) => {
    const farmSDK = farmSDKs?.[toPubString(jsonInfo.id)]
    const ammId = liquidityJsons.select(jsonInfo.lpMint, 'lpMint')?.id
    const pairJson = ammId ? pairJsons?.get(ammId) : undefined
    const lpPrice = pairJsons?.select(jsonInfo.lpMint, 'lpMint')?.lpPrice ?? undefined
    const tvl = lpPrice != null && farmSDK ? mul(String(farmSDK.lpVault.amount), lpPrice) : undefined
    const apr =
      pairJson &&
      ({
        '24h': pairJson.apr24h,
        '30d': pairJson.apr30d,
        '7d': pairJson.apr7d
      } as FarmSYNInfo['rewards'][number]['apr'])
    return {
      name: jsonInfo.symbol,
      base: jsonInfo.baseMint,
      quote: jsonInfo.quoteMint,
      category: jsonInfo.category,
      tvl,
      rewards: jsonInfo.rewardInfos.map(
        (rewardJsonInfo) =>
          ({
            token: rewardJsonInfo.rewardMint,
            apr: apr,
            farmVersion: jsonInfo.version,
            type: rewardJsonInfo.rewardType,
            perSecond: rewardJsonInfo.rewardPerSecond,
            openTime: rewardJsonInfo.rewardOpenTime && new Date(rewardJsonInfo.rewardOpenTime * 1000),
            endTime: rewardJsonInfo.rewardEndTime && new Date(rewardJsonInfo.rewardEndTime * 1000)
          } as FarmSYNInfo['rewards'][number])
      )
    } as FarmSYNInfo
  })
}
