import { createAtom } from '../../../packages/pivkit'
import { RAYMint, SOLMint } from '../../configs/wellknowns'
import { Mint, Numberish } from '../../utils/dataStructures/type'
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
export const pairInfosAtom = createAtom<PairJson[]>()
export const isPairInfoLoadingAtom = createAtom(false)
