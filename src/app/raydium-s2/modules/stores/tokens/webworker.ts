import { getRaydiumSDKRoot } from '../common/utils/getRaydiumSDKRoot'
import { registMessageReceiver } from '../../webworker/worker_sdk'

export function regist() {
  registMessageReceiver('fetch raydium supported tokens', async () => {
    const raydium = await getRaydiumSDKRoot()
    return raydium.token.allTokens
  })
}
