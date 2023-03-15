import { Farm, FarmFetchMultipleInfoParams } from '@raydium-io/raydium-sdk'
import { jsonInfo2PoolKeys } from '../../../utils/sdkTools/jsonInfo2PoolKeys'
import { getConnection } from '../../../utils/common/getConnection'
import toPubString, { toPub } from '../../../utils/common/pub'
import { fetchFarmJsonInfo } from './fetchFarmJson'
import { FarmSYNInfo } from '../type'
import { createAbortableAsyncTask } from '../../../../../packages/fnkit/createAbortableAsyncTask'

/* TODO: move to `/utils` */
/** and state info  */

export function getFarmSYNInfo(payload: { owner: string; rpcUrl: string; farmApiUrl: string }) {
  return createAbortableAsyncTask<FarmSYNInfo[]>(async (resolve, reject, aborted) => {
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
    const farmSYNInfos = [...farmJsonInfos.values()].map((jsonInfo) => {
      const sdkInfo = farmSDKInfos[toPubString(jsonInfo.id)]
      return {
        name: jsonInfo.symbol,
        baseMint: jsonInfo.baseMint,
        quoteMint: jsonInfo.quoteMint,
        category: jsonInfo.category
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
