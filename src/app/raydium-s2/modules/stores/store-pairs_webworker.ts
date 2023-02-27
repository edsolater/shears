import { raydiumPromise } from '../$root/utils/getRaydiumSDKRoot'
import { registMessageReceiver } from '../webworker/worker_sdk'
import { FetchPairsOptions } from './store-pairs_type'

export function regist() {
  registMessageReceiver<FetchPairsOptions>('fetch raydium pair info', async (data) => {
    const raydium = await raydiumPromise
    await raydium.liquidity.loadPairs({ forceUpdate: data.force })
    return raydium.liquidity.allPairs
  })
}
