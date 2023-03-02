import { createOnFirstAccessCallback } from '@edsolater/pivkit'
import { reconcile } from 'solid-js/store'
import { appApiUrls } from '../common/utils/config'
import { queryWebWorker } from '../common/webworker/worker_receiver'
import { FetchPairsOptions, JsonPairItemInfo } from './types/type'

export type PairsStore = {
  pairsState: 'before-init' | 'loaded'
  isPairsLoading: boolean
  allAPIPairs: JsonPairItemInfo[]
}

export const defaultPairsStore: PairsStore = { pairsState: 'before-init', isPairsLoading: false, allAPIPairs: [] }

export const initAllPairs = createOnFirstAccessCallback<PairsStore, 'allAPIPairs'>(
  'allAPIPairs',
  async (_, { setPairsState, setIsPairsLoading, setAllAPIPairs, setStore }) => {
    setIsPairsLoading(true)
    const allAPIPairs = await fetchPairInfoInMainThread()
    setPairsState('loaded')
    setIsPairsLoading(false)
    allAPIPairs && setAllAPIPairs(allAPIPairs.slice(0, 8))
    let count = 0
    const clonedAllAPIPairs = structuredClone(allAPIPairs)
    setInterval(() => {
      const newPairs = clonedAllAPIPairs?.slice(0, 8).map((i) => ({ ...i, name: i.name + count }))
      newPairs && setStore('allAPIPairs', reconcile(newPairs))
      count++
    }, 1000)
  }
)
function fetchPairInfoInMainThread() {
  return queryWebWorker<JsonPairItemInfo[], FetchPairsOptions>('fetch raydium pairs info', {
    url: appApiUrls.pairs,
    force: false
  })
}
