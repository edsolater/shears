import { createSmartStore } from '../../../packages/pivkit'
import { RAYMint, SOLMint } from '../../configs/wellknowns'
import { Token } from '../../utils/dataStructures/Token'
import { Mint, Numberish } from '../../utils/dataStructures/type'
import { loadFarmJsonInfos } from './actions/loadFarmJsonInfos'
import { loadFarmSYNInfos } from './actions/loadFarmSYNInfos'
import { loadPairs } from './actions/loadPairs'
import { loadTokensInfos } from './actions/loadTokens'
import { FarmJSON, FarmSYNInfo } from './types/farm'
import { PairJson } from './types/pairs'

export type StoreData = {
  // -------- swap --------
  swapInputToken1: Mint
  swapInputToken2: Mint
  swapInputTokenAmount1?: Numberish
  swapInputTokenAmount2?: Numberish

  // -------- farms --------
  farmJsonInfos?: FarmJSON[]
  isFarmJsonLoading?: boolean
  farmInfos?: FarmSYNInfo[]
  isFarmInfosLoading?: boolean

  // -------- pairs --------
  pairInfos?: PairJson[]
  isPairInfoLoading?: boolean

  // -------- token --------
  isTokenListLoading?: boolean
  tokens?: Token[]

  // -------- price --------
  isTokenPriceLoading?: boolean
  prices?: { mint: string; price: Numberish }[]
}

export const {
  store: store,
  unwrappedStore: storeData,
  setStore: setStore,
  createStorePropertySignal,
  createStorePropertySetter,
} = createSmartStore<StoreData>(
  {
    swapInputToken1: RAYMint,
    swapInputToken2: SOLMint,
  },
  {
    onFirstAccess: {
      farmJsonInfos: loadFarmJsonInfos,
      farmInfos: loadFarmSYNInfos,
      isPairInfoLoading: loadPairs,
      prices: loadPairs,
      tokens: loadTokensInfos,
    },
  },
)
