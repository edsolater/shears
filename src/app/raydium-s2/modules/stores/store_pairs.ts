import { createOnFirstAccessCallback } from '@edsolater/pivkit'
import { ApiJsonPairInfo } from 'test-raydium-sdk-v2'
import { queryWebWorker } from '../$worker/worker_receiver'

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
    setAllAPIPairs(allTokens)
  }
)
function fetchPairInfoInMainThread() {
  return queryWebWorker<ApiJsonPairInfo[]>('fetch raydium pair info')
}
