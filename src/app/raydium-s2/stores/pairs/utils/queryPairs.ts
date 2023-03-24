import { Store } from '../../../../../packages/pivkit'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../../utils/webworker/mainThread_receiver'
import { PairsStore } from '../store'
import { FetchPairsOptions, PairJson } from '../type'

export function queryPairs(store: Store<PairsStore>) {
  store.set({ isLoading: true })
  getPairJson((allPairJsonInfos) => {
    store.set({ isLoading: false, infos: allPairJsonInfos.slice(0, 50) })
    let count = 0
    const clonedAllPairJsonInfos = structuredClone(allPairJsonInfos)
    const timeoutId = setInterval(() => {
      const newPairs = clonedAllPairJsonInfos?.slice(0, 50).map((i) => ({ ...i, name: i.name + count }))
      newPairs && store.set({ isLoading: false, infos: newPairs.slice(0, 50) })
      count++
    }, 1000)
    return () => clearInterval(timeoutId)
  })
}

function getPairJson(cb: WebworkerSubscribeCallback<PairJson[]>) {
  return subscribeWebWorker<PairJson[], FetchPairsOptions>(
    {
      description: 'fetch raydium pairs info',
      payload: {
        force: false
      }
    },
    cb
  )
}
