import { createSignal } from 'solid-js'
import { createCachedGlobalHook } from '../../../../packages/pivkit'
import { appApiUrls } from '../../utils/common/config'
import { subscribeWebWorker, WebworkerSubscribeCallback } from '../../utils/webworker/mainThread_receiver'
import { FetchPairsOptions, JsonPairItemInfo } from './type'

export const usePairsStore = createCachedGlobalHook(() => {
  const [isLoading, setIsLoading] = createSignal(false)
  const [pairsInfos, setPairsInfos] = createSignal<JsonPairItemInfo[]>([])
  function loadData() {
    setIsLoading(true)
    getPairJson((allPairJsonInfos) => {
      setIsLoading(false)
      allPairJsonInfos && setPairsInfos(allPairJsonInfos.slice(0,200))
      // let count = 0
      // const clonedAllPairJsonInfos = structuredClone(allPairJsonInfos)
      // const timeoutId = setInterval(() => {
      //   const newPairs = clonedAllPairJsonInfos?.slice(0, 8).map((i) => ({ ...i, name: i.name + count }))
      //   newPairs && setStore('allPairJsonInfos', reconcile(newPairs))
      //   count++
      // }, 1000)
      // return () => clearInterval(timeoutId)
    })
  }
  loadData()
  const store = {
    get infos() {
      return pairsInfos()
    },
    get isLoading() {
      return isLoading()
    },
    refetch() {
      loadData()
    }
  }
  return store
})

export function getPairJson(cb: WebworkerSubscribeCallback<JsonPairItemInfo[]>) {
  return subscribeWebWorker<JsonPairItemInfo[], FetchPairsOptions>(
    {
      description: 'fetch raydium pairs info',
      payload: {
        url: appApiUrls.pairs,
        force: false
      }
    },
    cb
  )
}
