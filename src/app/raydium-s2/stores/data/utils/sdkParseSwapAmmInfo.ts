import { AmmV3, PublicKeyish, ReturnTypeFetchMultiplePoolTickArrays, TradeV2 } from '@raydium-io/raydium-sdk'
import toPubString, { toPub } from '../../../utils/dataStructures/Publickey'
import { ApiPoolInfo } from '../types/ammPools'
import { Connection, PublicKey } from '@solana/web3.js'
import { SOLMint } from '../../../configs/wellknowns'

type SimulatePoolCacheType = Promise<Awaited<ReturnType<(typeof TradeV2)['fetchMultipleInfo']>> | undefined>
type TickCache = Promise<ReturnTypeFetchMultiplePoolTickArrays | undefined>

// TODO: timeout-map
const sdkCaches: Map<
  string,
  {
    routes: ReturnType<(typeof TradeV2)['getAllRoute']>
    tickCache: TickCache
    poolInfosCache: SimulatePoolCacheType
  }
> = new Map()

export function clearSdkCache() {
  sdkCaches.clear()
}

/**
 * api amm info → pre-sdk-paresed amm info
 */
export function sdkParseSwapAmmInfo({
  connection,
  inputMint,
  outputMint,

  apiPoolList,
  sdkParsedAmmV3PoolInfo,
}: {
  connection: Connection
  inputMint: string
  outputMint: string

  apiPoolList: ApiPoolInfo
  sdkParsedAmmV3PoolInfo: Awaited<ReturnType<(typeof AmmV3)['fetchMultiplePoolInfos']>>
}) {
  const key = toPubString(inputMint) + toPubString(outputMint)
  if (!sdkCaches.has(key)) {
    const routes = TradeV2.getAllRoute({
      inputMint: inputMint === SOLMint ? PublicKey.default : toPub(inputMint),
      outputMint: outputMint === SOLMint ? PublicKey.default : toPub(outputMint),
      apiPoolList: apiPoolList,
      ammV3List: Object.values(sdkParsedAmmV3PoolInfo).map((i) => i.state),
    })
    const tickCache = AmmV3.fetchMultiplePoolTickArrays({
      connection,
      poolKeys: routes.needTickArray,
      batchRequest: true,
    }).catch((err) => {
      sdkCaches.delete(key)
      return undefined
    })
    const poolInfosCache = TradeV2.fetchMultipleInfo({
      connection,
      pools: routes.needSimulate,
      batchRequest: true,
    }).catch((err) => {
      sdkCaches.delete(key)
      return undefined
    })

    sdkCaches.set(key, { routes, tickCache, poolInfosCache })
  }
  return sdkCaches.get(key)!
}
