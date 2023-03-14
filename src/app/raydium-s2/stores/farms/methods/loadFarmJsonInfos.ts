import { appApiUrls } from '../../../utils/common/config'
import { WebworkerSubscribeCallback, subscribeWebWorker } from '../../../utils/webworker/mainThread_receiver'
import { useFarmStore } from '../store'
import { FarmJSONInfo, FetchFarmsJSONPayloads } from '../type'

export function loadFarmJsonInfos() {
  useFarmStore().$setters.setIsFarmJsonLoading(true)
  console.log('fetched in farm json Atrom')
  getFarmJsonFromWorker((allFarmJsonInfos) => {
    useFarmStore().$setters.setIsFarmJsonLoading(false)
    allFarmJsonInfos && useFarmStore().$setters.setFarmJsonInfos(allFarmJsonInfos)
  })
}

function getFarmJsonFromWorker(cb: WebworkerSubscribeCallback<FarmJSONInfo[]>) {
  return subscribeWebWorker<FarmJSONInfo[], FetchFarmsJSONPayloads>(
    {
      description: 'fetch raydium farms info',
      payload: { url: appApiUrls.farmInfo }
    },
    cb
  )
}
