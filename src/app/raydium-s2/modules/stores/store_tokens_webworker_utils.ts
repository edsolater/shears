import { getRaydiumSDKRoot } from '../$root/utils/getRaydiumSDKRoot'
import { registMessageReceiver } from '../$worker/worker_sdk'

registMessageReceiver('fetch raydium supported tokens', async (data) => {
  const raydium = await getRaydiumSDKRoot()
  const allTokens = raydium.token.allTokens
  return allTokens
})
