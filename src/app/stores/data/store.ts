/************ store ************
 * only in main thread
 *******************************/

import { addEventListener, createSmartStore } from "@edsolater/pivkit"
import { createShuck } from "../../../packages/conveyor/smartStore/shuck"
import { RAYMint, SOLMint } from "../../configs/wellKnownMints"
import { Mint, Numberish, type Price } from "../../utils/dataStructures/type"
import { TxVersion } from "../../utils/txHandler/txVersion"
import { RPCEndpoint, availableRpcs } from "./RPCEndpoint"
import { loadFarmJsonInfos } from "./portActions/loadFarmJsonInfos_main"
import { loadFarmSYNInfos } from "./portActions/loadFarmSYNInfos_main"
import { loadPairs } from "./portActions/loadPairs_main"
import { loadTokenPrice } from "./portActions/loadTokenPrice_main"
import { loadTokens } from "./portActions/loadTokens_main"
import { Token, type Tokens } from "./token/type"
import type { ClmmJsonInfo } from "./types/clmm"
import { ClmmInfos } from "./types/clmm"
import { FarmInfo, FarmJSON } from "./types/farm"
import { PairInfo } from "./types/pairs"
import type { TokenAccount } from "../../utils/dataStructures/TokenAccount"
import type { Collection } from "@edsolater/fnkit"
import { loadOwnerTokenAccounts } from "./portActions/loadOwnerTokenAccounts_main"

export type StoreData = {
  // -------- swap --------
  swapLoadCount?: number // not good, should change automaticly. change this will start loading swap related info
  swapInputToken1: Mint | Token
  swapInputToken2: Mint | Token
  swapInputTokenAmount1?: Numberish
  swapInputTokenAmount2?: Numberish

  // -------- farms --------
  farmLoadCount?: number // not good, should change automaticly. change this will start loading farm related info
  farmJsonInfos?: Record<FarmJSON["id"], FarmJSON>
  isFarmJsonLoading?: boolean
  farmInfos?: Record<FarmInfo["id"], FarmInfo>
  isFarmInfosLoading?: boolean

  // -------- pairs --------
  pairLoadCount?: number // not good, should change automaticly. change this will start loading pair related info
  pairInfos?: Record<PairInfo["ammId"], PairInfo>
  isPairInfoLoading?: boolean

  // -------- token --------

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
    },
  },
)
globalThis.document.addEventListener("DOMContentLoaded", () => {
  loadTokens()
  loadTokenPrice()
  loadOwnerTokenAccounts()
  console.log("🤔")
})

export type Prices = Map<Mint, Price>
export type Balances = Collection<Numberish, Mint>

// TODO: should all state just use shuck
// token
export const shuck_isTokenPricesLoading = createShuck<boolean | undefined>()

export const shuck_tokenPrices = createShuck<Prices | undefined>()
// token accounts & balance
export const shuck_isTokenAccountsLoading = createShuck<boolean | undefined>()
export const shuck_tokenAccounts = createShuck<Collection<TokenAccount, TokenAccount["publicKey"]> | undefined>()

export const shuck_balances = createShuck<Balances | undefined>() // TODO: should extends by tokenAccounts
// wallet
export const shuck_owner = createShuck<string | undefined>()
// app settings
export const shuck_txVersion = createShuck<TxVersion | undefined>()
export const shuck_rpc = createShuck<RPCEndpoint | undefined>()
export const shuck_isMobile = createShuck<boolean | undefined>()
export const shuck_slippage = createShuck<Numberish>(0.003)
// clmm
export const shuck_isClmmJsonInfoLoading = createShuck<boolean | undefined>()
export const shuck_clmmInfos = createShuck<ClmmInfos | undefined>()
// clmm ui
export const allClmmTabs = ["ALL", "MY POOLS"] as const
export const shuck_uiCurrentClmmTab = createShuck<(typeof allClmmTabs)[number] | undefined>()
// token
export const shuck_isTokenListLoading = createShuck<boolean | undefined>()
export const shuck_isTokenListLoadingError = createShuck<boolean | undefined>()
export const shuck_tokens = createShuck<Tokens | undefined>()

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
