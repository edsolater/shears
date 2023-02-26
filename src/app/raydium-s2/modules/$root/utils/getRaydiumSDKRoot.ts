import { LazyPromise } from '@edsolater/fnkit'
import { Raydium, RaydiumLoadParams } from 'test-raydium-sdk-v2'
import { urlConfigs } from './config'
import { getConnection } from './getConnection'

/** async */
export function getRaydiumSDKRoot(
  options: RaydiumLoadParams = { connection: getConnection(), urlConfigs: urlConfigs }
) {
  return LazyPromise.resolve(() => {
    console.log('start')
    return Raydium.load(options)
  })
}

export const raydiumPromise = getRaydiumSDKRoot()
