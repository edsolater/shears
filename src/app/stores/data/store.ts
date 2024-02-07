import { createStore } from '../../../packages/conveyor/solidjsAdapter/smartStore/createSmartStore'
import { createSmartStore } from '@edsolater/pivkit'
import { RAYMint, SOLMint } from '../../configs/wellKnownMints'
import { Token } from '../../utils/dataStructures/Token'
import { Mint, Numberish } from '../../utils/dataStructures/type'
import { RPCEndpoint, availableRpcs } from './RPCEndpoint'
import { loadFarmJsonInfos } from './portActions/loadFarmJsonInfos_main'
import { loadFarmSYNInfos } from './portActions/loadFarmSYNInfos_main'
import { loadPairs } from './portActions/loadPairs_main'
import { loadTokenPrice } from './portActions/loadTokenPrice_main'
import { loadTokens } from './portActions/loadTokens_main'
import { FarmJSON, FarmInfo } from './types/farm'
import { PairInfo } from './types/pairs'

export type StoreData = {
  // -------- swap --------
  swapLoadCount?: number // not good, should change automaticly. change this will start loading swap related info
  swapInputToken1: Mint | Token
  swapInputToken2: Mint | Token
  swapInputTokenAmount1?: Numberish
  swapInputTokenAmount2?: Numberish

  // -------- farms --------
  farmLoadCount?: number // not good, should change automaticly. change this will start loading farm related info
  farmJsonInfos?: Record<FarmJSON['id'], FarmJSON>
  isFarmJsonLoading?: boolean
  farmInfos?: Record<FarmInfo['id'], FarmInfo>
  isFarmInfosLoading?: boolean

  // -------- pairs --------
  pairLoadCount?: number // not good, should change automaticly. change this will start loading pair related info
  pairInfos?: Record<PairInfo['ammId'], PairInfo>
  isPairInfoLoading?: boolean

  // -------- token --------
  tokenLoadCount?: number // not good, should change automaticly. change this will start loading token related info
  isTokenListLoading?: boolean
  tokens?: Record<Token['mint'], Token>

  // -------- price --------
  priceLoadCount?: number // not good, should change automaticly. change this will start loading price related info
  isTokenPriceLoading?: boolean
  prices?: { mint: string; price: Numberish }[]

  // -------- app setting --------
  rpc?: RPCEndpoint

  // -------- clmm --------
  clmmInfos?: Record<string, any>
}

export const {
  store: store,
  unwrappedStore: storeData,
  setStore: setStore,
  createStorePropertySignal,
  createStorePropertySetter,
} = createSmartStore<StoreData>(
  { swapInputToken1: RAYMint, swapInputToken2: SOLMint, rpc: availableRpcs[0] },
  {
    onFirstAccess: {
      farmJsonInfos: loadFarmJsonInfos,
      farmInfos: loadFarmSYNInfos,
      pairInfos: loadPairs,
      prices: loadTokenPrice,
      tokens: loadTokens,
    },
  },
)

// export const {
//   store: rootStore,
//   branchStore: rootBranch,
//   setStore: setBStore,
// } = createBStore<StoreData>({
//   swapInputToken1: RAYMint,
//   swapInputToken2: SOLMint,
//   rpc: availableRpcs[0],
// })
