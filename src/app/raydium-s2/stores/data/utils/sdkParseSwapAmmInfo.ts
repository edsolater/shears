import { ReturnTypeFetchMultiplePoolTickArrays, TradeV2 } from '@raydium-io/raydium-sdk'

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
