import { createStore, unwrap } from 'solid-js/store'
import { createAtom, createSmartStore, createStoreAtom } from '../../../packages/pivkit'
import { RAYMint, SOLMint } from '../../configs/wellknowns'
import { Mint, Numberish } from '../../utils/dataStructures/type'
import { loadPairs } from './actions/loadPairs'
import { FarmJSON, FarmSYNInfo } from './types/farm'
import { PairJson } from './types/pairs'

// -------- #swap --------
export const swapInputToken1Atom = createAtom<Mint | undefined>(RAYMint)
export const swapInputToken2Atom = createAtom<Mint | undefined>(SOLMint)
export const swapInputTokenAmount1Atom = createAtom<Numberish | undefined>()
export const swapInputTokenAmount2Atom = createAtom<Numberish | undefined>()

// -------- #farm --------
export const farmJsonInfosAtom = createAtom<FarmJSON[]>()
export const isFarmJsonLoadingAtom = createAtom(false)
export const farmInfosAtom = createAtom<FarmSYNInfo[]>()
export const isFarmInfosLoadingAtom = createAtom(false)

// -------- #pair --------
export const pairInfosAtom = createAtom<PairJson[]>([], { onFirstAccess: loadPairs })
export const isPairInfoLoadingAtom = createAtom(false)

type AppStore = {
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
}

export const appStore = createStoreAtom<AppStore>({
  swapInputToken1: RAYMint,
  swapInputToken2: SOLMint,
})

export const {
  store,
  unwrappedStore,
  setStore: setStore,
} = createSmartStore<AppStore>({
  swapInputToken1: RAYMint,
  swapInputToken2: SOLMint,
})
export const untrackedStore = new Proxy(store, {
  get(target, p, receiver) {
    const pureStore = unwrap(target)
    return Reflect.get(pureStore, p, receiver)
  },
})
