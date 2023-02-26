import { raydiumPromise } from '../$root/utils/getRaydiumSDKRoot'
import { registMessageReceiver } from '../$worker/worker_sdk'

export function regist() {
  registMessageReceiver('fetch raydium pair info', async () => {
    const raydium = await raydiumPromise
    return raydium.liquidity.allPairs
  })
}
