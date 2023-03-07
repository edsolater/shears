import { createSubscribable } from '@edsolater/fnkit'
import { Farm, FarmFetchMultipleInfoParams } from '@raydium-io/raydium-sdk'
import { jsonInfo2PoolKeys } from '../../utils/sdkTools/jsonInfo2PoolKeys'
import { getConnection } from '../common/utils/getConnection'
import { toPub } from '../common/utils/pub'
import { registMessageReceiver } from '../common/webworker/worker_sdk'
import { fetchFarmJsonInfo } from './fetchFarmJson'
import { FarmPoolJsonInfo, FetchFarmsJsonPayloads, FetchFarmsSDKInfoPayloads, SdkParsedFarmInfo } from './type'

const [cachedFarmJsons$, setCachedFarmJsons] = createSubscribable<FarmPoolJsonInfo[]>([])

export function registInWorker() {
  registMessageReceiver<FetchFarmsJsonPayloads>('fetch raydium farms info', ({ payload, resolve }) =>
    fetchFarmJsonInfo(payload).then((infos) => {
      setCachedFarmJsons(infos ?? [])
      resolve(infos)
    })
  )

  registMessageReceiver<FetchFarmsSDKInfoPayloads>(
    'parse raydium farms info sdk list',
    async ({ payload: { rpcUrl, owner }, resolve, onCleanUp }) => {
      const connection = getConnection(rpcUrl)
      const { abort } = cachedFarmJsons$.subscribe(async (cachedFarmJsons) => {
        console.log('cachedFarmJsons: ', cachedFarmJsons)
        if (!cachedFarmJsons?.length) return
        const sdkParsedInfos = await getSdkParsedFarmInfo(
          {
            connection,
            pools: cachedFarmJsons.map(jsonInfo2PoolKeys),
            owner: toPub(owner),
            config: { commitment: 'confirmed' }
          },
          { jsonInfos: cachedFarmJsons }
        )
        // if (sdkParsedInfos.length) return abort
        console.log('sdkParsedInfos: ', sdkParsedInfos)
        resolve(sdkParsedInfos)
      })
      onCleanUp(abort)
    }
  )
}

/** and state info  */
export async function getSdkParsedFarmInfo(
  options: FarmFetchMultipleInfoParams,
  payload: {
    jsonInfos: FarmPoolJsonInfo[]
  }
): Promise<SdkParsedFarmInfo[]> {
  console.log('options: ', options)
  const rawInfos = await Farm.fetchMultipleInfoAndUpdate(options)
  console.log('rawInfos: ', rawInfos)
  const result = options.pools.map((pool, idx) => {
    return {
      ...payload.jsonInfos[idx],
      ...pool,
      ...rawInfos[String(pool.id)],
      fetchedMultiInfo: rawInfos[String(pool.id)],
      jsonInfo: payload.jsonInfos[idx]
    } as unknown as SdkParsedFarmInfo
  })
  return result
}
