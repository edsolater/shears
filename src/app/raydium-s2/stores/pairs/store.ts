import { createGlobalStore, createStoreDefaultState } from '@edsolater/pivkit'
import { initAllPairs } from './initAllPairs'
import { JsonPairItemInfo } from './type'

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

export const usePairStore = createGlobalStore<PairsStore>(defaultPairsStore, { onFirstAccess: [initAllPairs] })
