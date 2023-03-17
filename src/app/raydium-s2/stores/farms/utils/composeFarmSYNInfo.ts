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

export function composeFarmSYNInfo(payload: {
  owner: string
  rpcUrl: string
  pairApiUrl: string
  liquidityUrl: string
  farmApiUrl: string
}) {
  return createAbortableAsyncTask<FarmStore['farmSYNInfos']>(async (resolve, reject, aborted) => {
    if (aborted()) return
    const farmJsonInfos = await fetchFarmJsonInfo({ url: payload.farmApiUrl })
    if (!farmJsonInfos) {
      reject('fetch farm json info failed')
      return
    }

    if (aborted()) return
    const paramOptions: FarmFetchMultipleInfoParams = {
      connection: getConnection(payload.rpcUrl),
      pools: [...farmJsonInfos.values()].map(jsonInfo2PoolKeys),
      owner: toPub(payload.owner),
      config: { commitment: 'confirmed' }
    }
    console.log('start get sdk')
    const farmSDKInfos = await Farm.fetchMultipleInfoAndUpdate(paramOptions)
    if (!farmSDKInfos) {
      reject('fetch farm sdk info failed')
      return
    }
    console.log('end get sdk')

    if (aborted()) return
    const liquidityJsonInfos = await fetchLiquidityJson({ url: payload.liquidityUrl }) // TODO: 💡 url should not be a parameter , it's not strightforward (easy to read)
    if (!liquidityJsonInfos) {
      reject('fetch pair apr json info failed')
      return
    }

    if (aborted()) return
    const pairJsonInfos = await fetchPairJsonInfo({ url: payload.pairApiUrl })
    if (!pairJsonInfos) {
      reject('fetch pair apr json info failed')
      return
    }

    if (aborted()) return

    const lpMintAmmIdMap = new Map(
      [...liquidityJsonInfos.values()].map((pairAprJsonInfo) => [pairAprJsonInfo.lpMint, pairAprJsonInfo])
    )
    const lpPriceMap = new Map(
      [...pairJsonInfos.values()].map((pairJsonInfo) => [pairJsonInfo.lpMint, pairJsonInfo.lpPrice])
    )

    const farmSYNInfos = map(farmJsonInfos, (jsonInfo) => {
      const sdkInfo = farmSDKInfos[toPubString(jsonInfo.id)]
      const ammId = lpMintAmmIdMap.get(jsonInfo.lpMint)?.id
      const pairJsonInfo = ammId ? pairJsonInfos.get(ammId) : undefined
      const lpPrice = lpPriceMap.get(jsonInfo.lpMint) ?? undefined
      const tvl = lpPrice != null ? mul(String(sdkInfo.lpVault.amount), lpPrice) : undefined
      const apr =
        pairJsonInfo &&
        ({
          '24h': pairJsonInfo.apr24h,
          '30d': pairJsonInfo.apr30d,
          '7d': pairJsonInfo.apr7d
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
    if (!farmSYNInfos) {
      reject('hydrate farm syn info failed')
    } else {
      resolve(farmSYNInfos)
    }
  })
}
