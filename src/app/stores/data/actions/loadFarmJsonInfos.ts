import { createOnFirstAccess, Store } from '../../../../packages/pivkit'
import { subscribeWebWorker_Drepcated, WebworkerSubscribeCallback } from '../../../utils/webworker/mainThread_receiver'
import { DataStore } from '../store'
import { FetchFarmsJSONPayloads } from '../types/farm'

export const onAccessFarmJsonInfos = createOnFirstAccess<DataStore>(['farmJsonInfos', 'farmInfos'], (store) => {
  loadFarmJsonInfos(store)
})

export function loadFarmJsonInfos(store: Store<DataStore>) {
  store.set({ isFarmJsonLoading: true })
  getFarmJsonFromWorker((allFarmJsonInfos) => {
    store.set({ isFarmJsonLoading: false, farmJsonInfos: allFarmJsonInfos })
  })
}

export function getFarmJsonFromWorker(cb: WebworkerSubscribeCallback<DataStore['farmJsonInfos']>) {
  return subscribeWebWorker_Drepcated<DataStore['farmJsonInfos'], FetchFarmsJSONPayloads>(
    {
      command: 'fetch raydium farms info',
      payload: {},
    },
    cb,
  )
}
