import { map } from '@edsolater/fnkit'
import { Farm, FarmFetchMultipleInfoParams } from '@raydium-io/raydium-sdk'
import { createAbortableAsyncTask } from '../../../../../packages/fnkit/createAbortableAsyncTask'
import { getConnection } from '../../../utils/common/getConnection'
import toPubString, { toPub } from '../../../utils/common/pub'
import { jsonInfo2PoolKeys } from '../../../utils/sdkTools/jsonInfo2PoolKeys'
import { fetchLiquidityJson } from '../../apiInfos/fetchLiquidityJson'
import { usePairsStore } from '../../pairs/store'
import { fetchPairJsonInfo } from '../../pairs/utils/fetchPairJson'
import { FarmStore } from '../store'
import { FarmSYNInfo } from '../type'
import { fetchFarmAprJsonFile } from './fetchFarmAprJson'
import { fetchFarmJsonInfo } from './fetchFarmJson'

/* TODO: move to `/utils` */
/** and state info  */

export function composeFarmSYNInfo(payload: { owner: string; rpcUrl: string; liquidityUrl: string; farmApiUrl: string }) {
  return createAbortableAsyncTask<FarmStore['farmSYNInfos']>(async (resolve, reject, aborted) => {
    if (aborted()) return
    const farmJsonInfos = await fetchFarmJsonInfo({ url: payload.farmApiUrl })
    if (!farmJsonInfos) {
      reject('fetch farm json info failed')
      return
    }

    if (aborted()) return
    const options: FarmFetchMultipleInfoParams = {
      connection: getConnection(payload.rpcUrl),
      pools: [...farmJsonInfos.values()].map(jsonInfo2PoolKeys),
      owner: toPub(payload.owner),
      config: { commitment: 'confirmed' }
    }
    console.log('start get sdk')
    const farmSDKInfos = await Farm.fetchMultipleInfoAndUpdate(options)
    if (!farmSDKInfos) {
      reject('fetch farm sdk info failed')
      return
    }
    console.log('end get sdk')

    if (aborted()) return
    const pairAprJsonInfosPromise = fetchLiquidityJson({ url: payload.liquidityUrl })
    const farmSYNInfos = map(farmJsonInfos, (jsonInfo) => {
      const sdkInfo = farmSDKInfos[toPubString(jsonInfo.id)]
      return {
        name: jsonInfo.symbol,
        base: jsonInfo.baseMint,
        quote: jsonInfo.quoteMint,
        category: jsonInfo.category,
        // rewards: jsonInfo.rewardInfos.map(
        //   (jsonRewardInfo) =>
        //     new Proxy(
        //       {},
        //       {
        //         get(target, p, receiver) {
        //           if (p === 'token') return jsonRewardInfo['rewardMint']
        //           if (p === 'apr')
        //             return pairAprJsonInfosPromise.then(
        //               (pairAprJsonInfos) =>
        //                 pairAprJsonInfos && [...pairAprJsonInfos.values()].find((i) => i.lpMint === jsonInfo.lpMint) // TO BE CONTINUE
        //             )
        //         }
        //       }
        //     ) as FarmSYNInfo['rewards'][number]
        // )
      } as FarmSYNInfo
    })
    if (!farmSYNInfos) {
      reject('hydrate farm syn info failed')
    } else {
      resolve(farmSYNInfos)
    }
  })
  // const rawInfos = await Farm.fetchMultipleInfoAndUpdate(options)
  // console.log('rawInfos: ', rawInfos)
  // const result = options.pools.map((pool, idx) => {
  //   return {
  //     ...payload.jsonInfos[idx],
  //     ...pool,
  //     ...rawInfos[String(pool.id)],
  //     fetchedMultiInfo: rawInfos[String(pool.id)],
  //     jsonInfo: payload.jsonInfos[idx]
  //   } as unknown as FarmSDKInfo
  // })
  // return result
}
