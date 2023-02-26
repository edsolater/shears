import { createOnFirstAccessCallback } from '@edsolater/pivkit'
import { ApiJsonPairInfo, TokenJson } from 'test-raydium-sdk-v2'
import { queryWebWorker } from '../$worker/worker_receiver'

type PairsStore = {
  pairsState: 'before-init' | 'loaded'
  isPairsLoading: boolean
  allAPIPairs: ApiJsonPairInfo[]
}

export const defaultTokenStore = { pairsState: 'before-init', isPairsLoading: false, allAPIPairs: [] } as PairsStore

export const initAllTokens = createOnFirstAccessCallback<PairsStore, 'allAPIPairs'>(
  'allAPIPairs',
  async (_, { setPairsState, setIsPairsLoading, setAllAPIPairs }) => {
    setIsPairsLoading(true)
    const allTokens = await fetchPairInfo()
    setPairsState('loaded')
    setIsPairsLoading(false)
    setAllAPIPairs(allTokens)
  }
)
function fetchPairInfo() {
  return queryWebWorker<ApiJsonPairInfo[]>('fetch raydium pair info')
}

