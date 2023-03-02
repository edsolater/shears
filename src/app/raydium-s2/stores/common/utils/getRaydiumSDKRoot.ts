import { Raydium, RaydiumLoadParams } from 'test-raydium-sdk-v2'
import { appApiUrls as defaultUrlConfigs } from './config'
import { getConnection } from './getConnection'

let raydium: Promise<Raydium>
/** async */
export function getRaydiumSDKRoot(
  { connection = getConnection(), urlConfigs = defaultUrlConfigs, ...otherOptions }: Partial<RaydiumLoadParams> = {
    connection: getConnection()
  }
) {
  if (!raydium) {
    raydium = Raydium.load({ connection, urlConfigs, ...otherOptions })
  }
  return raydium
}
