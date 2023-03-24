import { Store } from '../../../../../packages/pivkit'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../../utils/webworker/mainThread_receiver'
import { DataStore } from '../store'
import { FetchFarmsJSONPayloads } from '../farmType'

export function loadFarmJsonInfos(store: Store<DataStore>) {
  store.set({ isFarmJsonLoading: true })
  getFarmJsonFromWorker((allFarmJsonInfos) => {
    store.set({ isFarmJsonLoading: false, farmJsonInfos: allFarmJsonInfos })
  })
}

export function getFarmJsonFromWorker(cb: WebworkerSubscribeCallback<DataStore['farmJsonInfos']>) {
  return subscribeWebWorker<DataStore['farmJsonInfos'], FetchFarmsJSONPayloads>(
    {
      description: 'fetch raydium farms info',
      payload: {}
    },
    cb
  )
}
