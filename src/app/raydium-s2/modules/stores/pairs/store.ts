import { createOnFirstAccessCallback } from '@edsolater/pivkit'
import { reconcile } from 'solid-js/store'
import { ApiJsonPairInfo } from 'test-raydium-sdk-v2'
import { queryWebWorker } from '../../webworker/worker_receiver'
import { FetchPairsOptions } from './types/type'

export type PairsStore = {
  pairsState: 'before-init' | 'loaded'
  isPairsLoading: boolean
  allAPIPairs: ApiJsonPairInfo[]
}

export const defaultPairsStore: PairsStore = { pairsState: 'before-init', isPairsLoading: false, allAPIPairs: [] }

export const initAllPairs = createOnFirstAccessCallback<PairsStore, 'allAPIPairs'>(
  'allAPIPairs',
  async (_, { setPairsState, setIsPairsLoading, setAllAPIPairs, setStore }) => {
    setIsPairsLoading(true)
    const allAPIPairs = await fetchPairInfoInMainThread()
    setPairsState('loaded')
    setIsPairsLoading(false)
    setAllAPIPairs(allAPIPairs.slice(0, 8))
    let count = 0
    const clonedAllAPIPairs = structuredClone(allAPIPairs)
    setInterval(() => {
      const newPairs = clonedAllAPIPairs.slice(0, 8).map((i) => ({ ...i, name: i.name + count }))
      setStore('allAPIPairs', reconcile(newPairs))
      count++
    }, 1000)
  }
)
function fetchPairInfoInMainThread() {
  return queryWebWorker<ApiJsonPairInfo[], FetchPairsOptions>('fetch raydium pairs info', { force: false })
}
