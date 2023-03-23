import { Store } from '../../../../../packages/pivkit'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../../utils/webworker/mainThread_receiver'
import { FarmStore } from '../store'
import { FetchFarmsJSONPayloads } from '../type'

export function loadFarmJsonInfos(store: Store<FarmStore>) {
  store.set({ isFarmJsonLoading: true })
  getFarmJsonFromWorker((allFarmJsonInfos) => {
    store.set({ isFarmJsonLoading: false, farmJsonInfos: allFarmJsonInfos })
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
