import { map } from '@edsolater/fnkit'
import { Farm, FarmFetchMultipleInfoParams } from '@raydium-io/raydium-sdk'
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

/* TODO: move to `/utils` */
/** and state info  */
export function composeFarmSYN(payload: {
  owner: string
  rpcUrl: string
  pairApiUrl: string
  liquidityUrl: string
  farmApiUrl: string
}) {
  return createAbortableAsyncTask<FarmStore['farmSYNInfos']>(async ({ resolve, aborted }) => {
    if (aborted()) return
    const farmJsonInfos = await fetchFarmJsonInfo({ url: payload.farmApiUrl })
    if (!farmJsonInfos) return

    if (aborted()) return
    const paramOptions: FarmFetchMultipleInfoParams = {
      connection: getConnection(payload.rpcUrl),
      pools: [...farmJsonInfos.values()].map(jsonInfo2PoolKeys),
      owner: toPub(payload.owner),
      config: { commitment: 'confirmed' }
    }
    console.log('start get sdk')
    const farmSDKs = await Farm.fetchMultipleInfoAndUpdate(paramOptions)
    if (!farmSDKs) return

    console.log('end get sdk')

    if (aborted()) return
    const liquidityJsons = await fetchLiquidityJson({ url: payload.liquidityUrl }) // TODO: 💡 url should not be a parameter , it's not strightforward (easy to read)
    if (!liquidityJsons) return

    if (aborted()) return
    const pairJsons = await fetchPairJsonInfo({ url: payload.pairApiUrl })
    if (!pairJsons) return

    if (aborted()) return

    const farmSYN = map(farmJsonInfos, (jsonInfo) => {
      const farmSDK = farmSDKs[toPubString(jsonInfo.id)]
      const ammId = liquidityJsons.get(jsonInfo.lpMint, 'lpMint')?.id
      const pairJson = ammId ? pairJsons.get(ammId) : undefined
      const lpPrice = pairJsons.get(jsonInfo.lpMint)?.lpPrice ?? undefined
      const tvl = lpPrice != null ? mul(String(farmSDK.lpVault.amount), lpPrice) : undefined
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
    if (!farmSYN) return

    resolve(farmSYN)
  })
}
