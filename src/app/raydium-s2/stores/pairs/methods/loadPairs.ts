import { appApiUrls } from '../../../utils/common/config'
import { WebworkerSubscribeCallback, subscribeWebWorker } from '../../../utils/webworker/mainThread_receiver'
import { usePairsStore } from '../store'
import { JsonPairItemInfo, FetchPairsOptions } from '../type'

export function loadData() {
  usePairsStore().$setters.setIsLoading(true)
  getPairJson((allPairJsonInfos) => {
    usePairsStore().$setters.setIsLoading(false)
    allPairJsonInfos && usePairsStore().$setters.setPairsInfos(allPairJsonInfos.slice(0, 200) /* TEMP */)
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

function getPairJson(cb: WebworkerSubscribeCallback<JsonPairItemInfo[]>) {
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
