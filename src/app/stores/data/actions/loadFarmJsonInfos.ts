import { createOnFirstAccess, Store } from '../../../../packages/pivkit'
import { getMessageReceiver, getMessageSender } from '../../../utils/webworker/loadWorker_main'
import { DataStore } from '../store'

export const onAccessFarmJsonInfos = createOnFirstAccess<DataStore>(['farmJsonInfos', 'farmInfos'], (store) => {
  loadFarmJsonInfos(store)
})

export function loadFarmJsonInfos(store: Store<DataStore>) {
  store.set({ isFarmJsonLoading: true })
  getFarmJsonFromWorker().subscribe((allFarmJsonInfos) => {
    store.set({ isFarmJsonLoading: false, farmJsonInfos: allFarmJsonInfos })
  })
}

export function getFarmJsonFromWorker() {
  const sender = getMessageSender('fetch raydium farms info')
  sender.query()

  const receiver = getMessageReceiver('fetch raydium farms info')
  return receiver
}
