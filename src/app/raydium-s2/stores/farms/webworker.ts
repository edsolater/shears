import { registMessageReceiver } from '../common/webworker/worker_sdk'
import { FarmPoolJsonInfo, FetchFarmsJsonPayloads, FetchFarmsSDKInfoPayloads, SdkParsedFarmInfo } from './type'
import { fetchFarmJsonInfo } from './fetchFarmJson'
import { getConnection } from '../common/utils/getConnection'
import { Farm, FarmFetchMultipleInfoParams, jsonInfo2PoolKeys } from '@raydium-io/raydium-sdk'
import { toPub } from '../common/utils/pub'

let cachedFarmJsons: FarmPoolJsonInfo[] = []

export function registInWorker() {
  registMessageReceiver<FetchFarmsJsonPayloads>('fetch raydium farms info', (payload) =>
    fetchFarmJsonInfo(payload).then((infos) => {
      cachedFarmJsons = infos ?? []
      return infos
    })
  )

  registMessageReceiver<FetchFarmsSDKInfoPayloads>('parse raydium farms info sdk list', async ({ rpcUrl, owner }) => {
    const connection = getConnection(rpcUrl)
    // TEMPLY don't use
    // const sdkParsedInfos = await getSdkParsedFarmInfo(
    //   {
    //     connection,
    //     pools: cachedFarmJsons.map(jsonInfo2PoolKeys),
    //     owner: toPub(owner),
    //     config: { commitment: 'confirmed' }
    //   },
    //   { jsonInfos: cachedFarmJsons }
    // )
    // console.log('sdkParsedInfos: ', sdkParsedInfos)
  })
}

/** and state info  */
// export async function getSdkParsedFarmInfo(
//   options: FarmFetchMultipleInfoParams,
//   payload: {
//     jsonInfos: FarmPoolJsonInfo[]
//   }
// ): Promise<SdkParsedFarmInfo[]> {
//   const rawInfos = await Farm.fetchMultipleInfoAndUpdate(options)
//   const result = options.pools.map((pool, idx) => {
//     return {
//       ...payload.jsonInfos[idx],
//       ...pool,
//       ...rawInfos[String(pool.id)],
//       fetchedMultiInfo: rawInfos[String(pool.id)],
//       jsonInfo: payload.jsonInfos[idx]
//     } as unknown as SdkParsedFarmInfo
//   })
//   return result
// }
