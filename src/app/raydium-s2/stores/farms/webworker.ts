import { registMessageReceiver } from '../common/webworker/worker_sdk'
import { FarmPoolJsonInfo, FetchFarmsJsonPayloads, FetchFarmsSDKInfoPayloads, SdkParsedFarmInfo } from './type'
import { fetchFarmJsonInfo } from './fetchFarmJson'
import { getConnection } from '../common/utils/getConnection'
import { Farm, FarmFetchMultipleInfoParams } from '@raydium-io/raydium-sdk'
import { toPub } from '../common/utils/pub'
import { createSubscribable } from '../../../../packages/fnkit/createSubscribable'
import { jsonInfo2PoolKeys } from '../../modules/sdkTools/jsonInfo2PoolKeys'

const [cachedFarmJsons$, setCachedFarmJsons] = createSubscribable<FarmPoolJsonInfo[]>([])

export function registInWorker() {
  registMessageReceiver<FetchFarmsJsonPayloads>('fetch raydium farms info', (payload) =>
    fetchFarmJsonInfo(payload).then((infos) => {
      setCachedFarmJsons(infos ?? [])
      return infos
    })
  )

  registMessageReceiver<FetchFarmsSDKInfoPayloads>('parse raydium farms info sdk list', async ({ rpcUrl, owner }) => {
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
    })
  })
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
