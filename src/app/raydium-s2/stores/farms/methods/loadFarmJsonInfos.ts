import { appApiUrls } from '../../../utils/common/config'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../../utils/webworker/mainThread_receiver'
import { FarmStore, useFarmStore } from '../store'
import { FetchFarmsJSONPayloads } from '../type'

export function loadFarmJsonInfos() {
  useFarmStore().$setters.setIsFarmJsonLoading(true)
  console.log('fetched in farm json Atrom')
  getFarmJsonFromWorker((allFarmJsonInfos) => {
    useFarmStore().$setters.setIsFarmJsonLoading(false)
    allFarmJsonInfos && useFarmStore().$setters.setFarmJsonInfos(allFarmJsonInfos)
  })
}

function getFarmJsonFromWorker(cb: WebworkerSubscribeCallback<FarmStore['farmJsonInfos']>) {
  return subscribeWebWorker<FarmStore['farmJsonInfos'], FetchFarmsJSONPayloads>(
    {
      description: 'fetch raydium farms info',
      payload: { url: appApiUrls.farmInfo }
    },
    cb
  )
}
