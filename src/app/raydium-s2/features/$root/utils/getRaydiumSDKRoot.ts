import { LazyPromise } from '@edsolater/fnkit'
import { Raydium, RaydiumLoadParams } from 'test-raydium-sdk-v2'
import { urlConfigs } from './config'
import { getConnection } from './getConnection'

/** async */
export function getRaydiumSDKRoot(
  options: RaydiumLoadParams = { connection: getConnection(), urlConfigs: urlConfigs }
  ) {
    return LazyPromise.resolve(() => Raydium.load(options))
  }
  
  /** async */
export function getRaydiumSDKTokens() {
  return getRaydiumSDKRoot().then((sdk) => sdk.token.allTokens)
}
