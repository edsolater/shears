import { reconcile } from 'solid-js/store'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../../utils/webworker/mainThread_receiver'
import { usePairsStore } from '../store'
import { FetchPairsOptions, PairJson } from '../type'

export function loadData() {
  usePairsStore().$setters.setIsLoading(true)
  getPairJson((allPairJsonInfos) => {
    usePairsStore().$setters.setIsLoading(false)
    allPairJsonInfos && usePairsStore().$setters.setPairsInfos(allPairJsonInfos.slice(0, 50) /* TEMP */)
    let count = 0
    const clonedAllPairJsonInfos = structuredClone(allPairJsonInfos)
    const timeoutId = setInterval(() => {
      const newPairs = clonedAllPairJsonInfos?.slice(0, 50).map((i) => ({ ...i, name: i.name + count }))
      newPairs && usePairsStore().$setters.setPairsInfos(reconcile(newPairs, {merge:true}))
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
