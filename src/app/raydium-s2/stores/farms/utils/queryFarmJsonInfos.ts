import { Store } from '../../../../../packages/pivkit'
import { appApiUrls } from '../../../utils/common/config'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../../utils/webworker/mainThread_receiver'
import { FarmStore, useFarmStore } from '../store'
import { FetchFarmsJSONPayloads } from '../type'

export function loadFarmJsonInfos(store: Store<FarmStore>) {
  store.set({ isFarmJsonLoading: true })
  getFarmJsonFromWorker((allFarmJsonInfos) => {
    store.set({ isFarmJsonLoading: false })
    allFarmJsonInfos &&   store.set({ farmJsonInfos: allFarmJsonInfos })
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
