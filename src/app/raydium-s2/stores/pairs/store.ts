import { createOnFirstAccessCallback, createStoreDefaultState } from '@edsolater/pivkit'
import { reconcile } from 'solid-js/store'
import { appApiUrls } from '../common/utils/config'
import { queryWebWorker } from '../common/webworker/worker_receiver'
import { FetchPairsOptions, JsonPairItemInfo } from './types/type'

export type PairsStore = {
  pairsState: 'before-init' | 'loaded'
  isPairsLoading: boolean
  allPairJsonInfos: JsonPairItemInfo[]
}

export const defaultPairsStore = createStoreDefaultState<PairsStore>(() => ({
  pairsState: 'before-init',
  isPairsLoading: false,
  allPairJsonInfos: []
}))

export const initAllPairs = createOnFirstAccessCallback<PairsStore>(
  'allPairJsonInfos',
  async ({ setPairsState, setIsPairsLoading, setAllPairJsonInfos, setStore }) => {
    setIsPairsLoading(true)
    const allPairJsonInfos = await fetchPairInfoInMainThread()
    setPairsState('loaded')
    setIsPairsLoading(false)
    allPairJsonInfos && setAllPairJsonInfos(allPairJsonInfos.slice(0, 8))
    let count = 0
    const clonedAllPairJsonInfos = structuredClone(allPairJsonInfos)
    setInterval(() => {
      const newPairs = clonedAllPairJsonInfos?.slice(0, 8).map((i) => ({ ...i, name: i.name + count }))
      newPairs && setStore('allPairJsonInfos', reconcile(newPairs))
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
