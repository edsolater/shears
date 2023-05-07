import { AmmV3, AmmV3PoolInfo, AmmV3PoolPersonalPosition } from '@raydium-io/raydium-sdk'
import toPubString from '../../../utils/dataStructures/Publickey'
import { ApiAmmV3PoolsItem } from '../types/ammPools'
import { Connection } from '@solana/web3.js'
import { listToMap } from '@edsolater/fnkit'

const parsedAmmV3PoolInfoCache = new Map<
  string,
  {
    state: AmmV3PoolInfo
    positionAccount?: AmmV3PoolPersonalPosition[] | undefined
  }
>()
/**
 * pre-sdk-paresed amm info 2
 */

export async function sdkParseCLMMPoolInfo({
  connection,
  apiAmmPools,
  chainTimeOffset = 0
}: {
  connection: Connection
  apiAmmPools: ApiAmmV3PoolsItem[]
  chainTimeOffset?: number
}) {
  const needRefetchApiAmmPools = apiAmmPools.filter(({ id }) => !parsedAmmV3PoolInfoCache.has(toPubString(id)))

  if (needRefetchApiAmmPools.length) {
    const sdkParsed = await AmmV3.fetchMultiplePoolInfos({
      poolKeys: needRefetchApiAmmPools,
      connection,
      batchRequest: true,
      chainTime: (Date.now() + chainTimeOffset) / 1000
    })
    Object.values(sdkParsed).forEach((sdk) => {
      parsedAmmV3PoolInfoCache.set(toPubString(sdk.state.id), sdk)
    })
  }

  const apiAmmPoolsArray = apiAmmPools.map(({ id }) => parsedAmmV3PoolInfoCache.get(toPubString(id))!)
  const map = listToMap(apiAmmPoolsArray, (i) => toPubString(i.state.id))
  return map
}
