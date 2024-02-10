import { Clmm, ClmmPoolInfo, ClmmPoolPersonalPosition } from '@raydium-io/raydium-sdk'
import toPubString from '../../../utils/dataStructures/Publickey'
import { Connection } from '@solana/web3.js'
import { listToMap } from '@edsolater/fnkit'
import type { JsonClmm } from '../types/clmm'

const parsedClmmPoolInfoCache = new Map<
  string,
  {
    state: ClmmPoolInfo
    positionAccount?: ClmmPoolPersonalPosition[] | undefined
  }
>()

/**
 * pre-sdk-paresed amm info 2
 */
export async function sdkParseCLMMPoolInfo({
  connection,
  apiAmmPools,
  chainTimeOffset = 0,
}: {
  connection: Connection
  apiAmmPools: JsonClmm[]
  chainTimeOffset?: number
}) {
  const needRefetchApiAmmPools = apiAmmPools.filter(({ id }) => !parsedClmmPoolInfoCache.has(toPubString(id)))

  if (needRefetchApiAmmPools.length) {
    const sdkParsed = await Clmm.fetchMultiplePoolInfos({
      poolKeys: needRefetchApiAmmPools,
      connection,
      batchRequest: true,
      chainTime: (Date.now() + chainTimeOffset) / 1000,
    })
    Object.values(sdkParsed).forEach((sdk) => {
      parsedClmmPoolInfoCache.set(toPubString(sdk.state.id), sdk)
    })
  }

  const apiAmmPoolsArray = apiAmmPools.map(({ id }) => parsedClmmPoolInfoCache.get(toPubString(id))!)
  const map = listToMap(apiAmmPoolsArray, (i) => toPubString(i.state.id))
  return map
}
