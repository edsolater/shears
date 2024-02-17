import { createSmartStore } from '@edsolater/pivkit'
import { RAYMint, SOLMint } from '../../configs/wellKnownMints'
import { Token } from '../../utils/dataStructures/Token'
import { Mint, Numberish } from '../../utils/dataStructures/type'
import { TxVersion } from '../../utils/txHandler/txVersion'
import { RPCEndpoint, availableRpcs } from './RPCEndpoint'
import { loadClmmInfos } from './portActions/loadClmmInfos_main'
import { loadFarmJsonInfos } from './portActions/loadFarmJsonInfos_main'
import { loadFarmSYNInfos } from './portActions/loadFarmSYNInfos_main'
import { loadPairs } from './portActions/loadPairs_main'
import { loadTokenPrice } from './portActions/loadTokenPrice_main'
import { loadTokens } from './portActions/loadTokens_main'
import type { ClmmJsonInfo } from './types/clmm'
import { FarmInfo, FarmJSON } from './types/farm'
import { PairInfo } from './types/pairs'
import { createShuck } from '../../../packages/conveyor/smartStore/shuck'
import { createSubscribable } from '@edsolater/fnkit'

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
  txVersion?: TxVersion

  // -------- clmm --------
  clmmJsonInfos?: Record<string, ClmmJsonInfo>
  isClmmJsonInfoLoading?: boolean
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
      clmmJsonInfos: loadClmmInfos,
    },
  },
)

// TODO: should all state just use shuck
export const rpc = createShuck<RPCEndpoint | undefined>() // test
// export const rpc = createShuck<RPCEndpoint | undefined>(() => availableRpcs[0])

// export const {
//   store: rootStore,
//   branchStore: rootBranch,
//   setStore: setBStore,
// } = createBStore<StoreData>({
//   swapInputToken1: RAYMint,
//   swapInputToken2: SOLMint,
//   rpc: availableRpcs[0],
// })
