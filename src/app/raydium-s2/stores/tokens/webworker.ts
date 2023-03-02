import { getRaydiumSDKRoot } from '../common/utils/getRaydiumSDKRoot'
import { registMessageReceiver } from '../common/webworker/worker_sdk'

export function registInWorker() {
  registMessageReceiver('fetch raydium supported tokens', async () => {
    const raydium = await getRaydiumSDKRoot()
    return raydium.token.allTokens
  })
}
