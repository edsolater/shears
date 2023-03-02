import { getRaydiumSDKRoot } from '../common/utils/getRaydiumSDKRoot'
import { registMessageReceiver } from '../common/webworker/worker_sdk'
import { FetchPairsOptions } from './types/type'

export function registInWorker() {
  registMessageReceiver<FetchPairsOptions>('fetch raydium pairs info', async (data) => {
    const raydium = await getRaydiumSDKRoot()
    await raydium.liquidity.loadPairs({ forceUpdate: data.force })
    return raydium.liquidity.allPairs
  })
}
