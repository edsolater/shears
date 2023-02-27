import { createOnFirstAccessCallback } from '@edsolater/pivkit'
import { ApiJsonPairInfo } from 'test-raydium-sdk-v2'
import { queryWebWorker } from '../webworker/worker_receiver'
import { FetchPairsOptions } from './store-pairs_type'

export type PairsStore = {
  pairsState: 'before-init' | 'loaded'
  isPairsLoading: boolean
  allAPIPairs: ApiJsonPairInfo[]
}

export const defaultPairsStore: PairsStore = { pairsState: 'before-init', isPairsLoading: false, allAPIPairs: [] }

export const initAllPairs = createOnFirstAccessCallback<PairsStore, 'allAPIPairs'>(
  'allAPIPairs',
  async (_, { setPairsState, setIsPairsLoading, setAllAPIPairs }) => {
    setIsPairsLoading(true)
    const allTokens = await fetchPairInfoInMainThread()
    setPairsState('loaded')
    setIsPairsLoading(false)
    setAllAPIPairs(allTokens.slice(0,2))
    let count = 0
    setInterval(() => {
      setAllAPIPairs(allTokens.slice(0,2).map((i) => ({ ...i, name: i.name + count })))
      count++
    }, 1000)
  }
)
function fetchPairInfoInMainThread() {
  return queryWebWorker<ApiJsonPairInfo[], FetchPairsOptions>('fetch raydium pair info', { force: false })
}
