import { getRaydiumSDKRoot } from '../$root/utils/getRaydiumSDKRoot'
import { registMessageReceiver } from '../webworker/worker_sdk'
import { FetchPairsOptions } from './store-pairs_type'

export function regist() {
  registMessageReceiver<FetchPairsOptions>('fetch raydium pairs info', async (data) => {
    const raydium = await getRaydiumSDKRoot()
    await raydium.liquidity.loadPairs({ forceUpdate: data.force })
    return raydium.liquidity.allPairs
  })
}
