import { Atom, createAtom } from '../../../../packages/pivkit'
import { RAYMint, SOLMint } from '../../../configs/wellknowns'
import { Mint, Numberish } from '../../../utils/dataStructures/type'

export const farmToken1 = createAtom<Mint | undefined>(RAYMint)
export const farmToken2 = createAtom<Mint | undefined>(SOLMint)
export const farmTokenAmount1 = createAtom<Numberish | undefined>()
export const farmTokenAmount2 = createAtom<Numberish | undefined>()
