import { createSmartStore } from '../../../packages/pivkit'
import { RAYMint, SOLMint } from '../../configs/wellKnownMints'
import { getConnection } from '../../utils/common/getConnection'
import { Token } from '../../utils/dataStructures/Token'
import { Mint, Numberish } from '../../utils/dataStructures/type'
import { loadFarmJsonInfos } from './actions/loadFarmJsonInfos_main'
import { loadFarmSYNInfos } from './actions/loadFarmSYNInfos_main'
import { loadPairs } from './actions/loadPairs_main'
import { loadTokensInfos } from './actions/loadTokens_main'
import { FarmJSON, FarmSYNInfo } from './types/farm'
import { PairJson } from './types/pairs'

export type StoreData = {
  // -------- swap --------
  swapInputToken1: Mint | Token
  swapInputToken2: Mint | Token
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

  // -------- app setting --------
  rpcUrl?: string
}

export const {
  store: store,
  unwrappedStore: storeData,
  setStore: setStore,
  createStorePropertySignal,
  createStorePropertySetter,
} = createSmartStore<StoreData>(
  { swapInputToken1: RAYMint, swapInputToken2: SOLMint },
  {
    onFirstAccess: {
      farmJsonInfos: loadFarmJsonInfos,
      farmInfos: loadFarmSYNInfos,
      isPairInfoLoading: loadPairs,
      pairInfos: loadPairs,
      prices: loadPairs,
      tokens: loadTokensInfos,
    }
  },
)
