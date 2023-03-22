import { Store } from '../../../../../packages/pivkit'
import { appApiUrls } from '../../../utils/common/config'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../../utils/webworker/mainThread_receiver'
import { FarmStore, useFarmStore } from '../store'
import { FetchFarmsJSONPayloads } from '../type'

export function loadFarmJsonInfos(store: Store<FarmStore>) {
  store.setIsFarmJsonLoading(true)
  getFarmJsonFromWorker((allFarmJsonInfos) => {
    store.setIsFarmJsonLoading(false)
    allFarmJsonInfos && store.setFarmJsonInfos(allFarmJsonInfos)
  })
}

export function getFarmJsonFromWorker(cb: WebworkerSubscribeCallback<FarmStore['farmJsonInfos']>) {
  return subscribeWebWorker<FarmStore['farmJsonInfos'], FetchFarmsJSONPayloads>(
    {
      description: 'fetch raydium farms info',
      payload: {}
    },
    cb
  )
}
