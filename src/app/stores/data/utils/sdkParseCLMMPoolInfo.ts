import { listToMap } from '@edsolater/fnkit'
import { Clmm as SDK_Clmm } from '@raydium-io/raydium-sdk'
import type { Connection } from '@solana/web3.js'
import { toList } from '../../../../packages/pivkit/fnkit/itemMethods'
import toPubString from '../../../utils/dataStructures/Publickey'
import type { APIClmmInfo, SDKClmmInfo } from '../types/clmm'

const sdkClmmInfoCache = new Map<string, SDKClmmInfo>()

/**
 * pre-sdk-paresed amm info 2
 */
export async function sdkParseClmmInfos({
  connection,
  apiClmmInfos: apiInfos,
  chainTimeOffset = 0,
}: {
  connection: Connection
  apiClmmInfos: APIClmmInfo[] | Record<string, APIClmmInfo>
  chainTimeOffset?: number
}): Promise<Record<string, SDKClmmInfo>> {
  const apiClmmInfos = toList(apiInfos)
  const needRefetchApiAmmPools = apiClmmInfos.filter(({ id }) => !sdkClmmInfoCache.has(toPubString(id)))

  if (needRefetchApiAmmPools.length) {
    const sdkParsed = await SDK_Clmm.fetchMultiplePoolInfos({
      poolKeys: needRefetchApiAmmPools,
      connection,
      batchRequest: true,
      chainTime: (Date.now() + chainTimeOffset) / 1000,
    })
    Object.values(sdkParsed).forEach((sdk) => {
      sdkClmmInfoCache.set(toPubString(sdk.state.id), sdk)
    })
  }

  const apiAmmPoolsArray = apiClmmInfos.map(({ id }) => sdkClmmInfoCache.get(toPubString(id))!)
  const map = listToMap(apiAmmPoolsArray, (i) => toPubString(i.state.id))
  return map
}
