import { createStore, unwrap } from 'solid-js/store'
import { createAtom, createSmartStore, createStoreAtom } from '../../../packages/pivkit'
import { RAYMint, SOLMint } from '../../configs/wellknowns'
import { Mint, Numberish } from '../../utils/dataStructures/type'
import { loadPairs } from './actions/loadPairs'
import { FarmJSON, FarmSYNInfo } from './types/farm'
import { PairJson } from './types/pairs'
import { loadFarmJsonInfos } from './actions/loadFarmJsonInfos'
import { loadFarmSYNInfos } from './actions/loadFarmSYNInfos'
import { Token } from '../../utils/dataStructures/Token'
import { loadTokensInfos } from './actions/loadTokens'

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
