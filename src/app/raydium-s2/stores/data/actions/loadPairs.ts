import { createOnFirstAccess, Store } from '../../../../../packages/pivkit'
import { subscribeWebWorker_Drepcated, WebworkerSubscribeCallback } from '../../../utils/webworker/mainThread_receiver'
import { FetchPairsOptions, PairJson } from '../types/pairs'
import { DataStore } from '../store'

export const onAccessPairsInfos = createOnFirstAccess<DataStore>(['pairInfos'], (store) => {
  loadPairs(store)
})

export function loadPairs(store: Store<DataStore>) {
  store.set({ isPairInfoLoading: true })
  getPairJsonFromWorker((allPairJsonInfos) => {
    store.set({ isPairInfoLoading: false, pairInfos: allPairJsonInfos.slice(0, 50) })
    let count = 0
    const clonedAllPairJsonInfos = structuredClone(allPairJsonInfos)
    const timeoutId = setInterval(() => {
      const newPairs = clonedAllPairJsonInfos?.slice(0, 50).map((i) => ({ ...i, name: i.name + count }))
      newPairs && store.set({ isPairInfoLoading: false, pairInfos: newPairs.slice(0, 50) })
      count++
    }, 1000)
    return () => clearInterval(timeoutId)
  })
}

function getPairJsonFromWorker(cb: WebworkerSubscribeCallback<PairJson[]>) {
  return subscribeWebWorker_Drepcated<PairJson[], FetchPairsOptions>(
    {
      description: 'fetch raydium pairs info',
      payload: {
        force: false
      }
    },
    cb
  )
}
