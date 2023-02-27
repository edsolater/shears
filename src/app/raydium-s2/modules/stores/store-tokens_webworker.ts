import { raydiumPromise } from '../$root/utils/getRaydiumSDKRoot'
import { registMessageReceiver } from '../webworker/worker_sdk'

export function regist() {
  registMessageReceiver('fetch raydium supported tokens', async () => {
    const raydium = await raydiumPromise
    return raydium.token.allTokens
  })
}
