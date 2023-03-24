import { createGlobalStore, createStoreDefault } from '../../../../packages/pivkit'
import { onAccessPairsInfos } from './actions/onAccessPairsInfos'
import { PairJson } from './type'

export type PairsStore = {
  readonly infos?: PairJson[]
  readonly isLoading: boolean
}

const defaultPairStore = createStoreDefault<PairsStore>(() => ({
  isLoading: false
}))

export const [usePairStore] = createGlobalStore(defaultPairStore, { onFirstAccess: [onAccessPairsInfos] })
