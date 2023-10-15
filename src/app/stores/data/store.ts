import { createGlobalStore } from '../../../packages/pivkit'
import { onAccessFarmJsonInfos } from './actions/loadFarmJsonInfos'
import { onAccessFarmSYNInfos } from './actions/loadFarmSYNInfos'
import { onAccessPairsInfos } from './actions/loadPairs'
import { onAccessTokensPrice } from './actions/loadTokenPrice'
import { onAccessTokens } from './actions/loadTokens'
import { FarmStore } from './types/farm'
import { PairsStore } from './types/pairs'
import { TokenListStore } from './types/tokenList'
import { TokenPriceStore } from './types/tokenPrice'

// export type DataStore = FarmStore & PairsStore & TokenListStore & TokenPriceStore
// const defaultStore = {}
// this format is old , please use atom format
// export const [useDataStore] = createGlobalStore<DataStore>(defaultStore, {
  // deprecated
  // onFirstAccess: [onAccessFarmJsonInfos, onAccessFarmSYNInfos, onAccessPairsInfos, onAccessTokens, onAccessTokensPrice],
// })
