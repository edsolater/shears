import { createSmartStore } from '../../../packages/pivkit'
import { RAYMint, SOLMint } from '../../configs/wellknowns'
import { Token, TokenLiteral, createTokenLiteral } from '../../utils/dataStructures/Token'
import { Mint, Numberish } from '../../utils/dataStructures/type'
import { loadFarmJsonInfos } from './actions/loadFarmJsonInfos'
import { loadFarmSYNInfos } from './actions/loadFarmSYNInfos'
import { loadPairs } from './actions/loadPairs'
import { loadTokensInfos } from './actions/loadTokens'
import { FarmJSON, FarmSYNInfo } from './types/farm'
import { PairJson } from './types/pairs'

export type StoreData = {
  // -------- swap --------
  swapInputToken1: TokenLiteral
  swapInputToken2: TokenLiteral
  swapInputTokenAmount1?: Numberish
  swapInputTokenAmount2?: Numberish

  // -------- farms --------
  farmJsonInfos?: Record<FarmJSON['id'], FarmJSON>
  isFarmJsonLoading?: boolean
  farmInfos?: Record<FarmSYNInfo['id'], FarmSYNInfo>
  isFarmInfosLoading?: boolean

  // -------- pairs --------
  pairInfos?: Record<PairJson['ammId'], PairJson>
  isPairInfoLoading?: boolean

  // -------- token --------
  isTokenListLoading?: boolean
  tokens?: Record<Token['mint'], Token>

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
    swapInputToken1: createTokenLiteral(RAYMint),
    swapInputToken2: createTokenLiteral(SOLMint),
  },
  {
    onFirstAccess: {
      farmJsonInfos: loadFarmJsonInfos,
      farmInfos: loadFarmSYNInfos,
      isPairInfoLoading: loadPairs,
      pairInfos: loadPairs,
      prices: loadPairs,
      tokens: loadTokensInfos,
    },
  },
)
