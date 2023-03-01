import { getRaydiumSDKRoot } from '../$root/utils/getRaydiumSDKRoot'
import { toPub } from '../$root/utils/pub'
import { registMessageReceiver } from '../webworker/worker_sdk'
import { FetchFarmsOptions } from './store-farms_type'

export function regist() {
  registMessageReceiver<FetchFarmsOptions>('fetch raydium farms info', async (data) => {
    const raydium = await getRaydiumSDKRoot({ owner: toPub(data.owner) })
    await raydium.farm.load({ forceUpdate: data.force })
    console.log('raydium.farm.allHydratedFarms: ', raydium.farm.allHydratedFarms)
    return raydium.farm.allFarms
  })
}
