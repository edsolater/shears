import { Atom, createAtom } from '../../../../packages/pivkit'
import { RAYMint, SOLMint } from '../../../configs/wellknowns'
import { Mint, Numberish } from '../../../utils/dataStructures/type'

export const swapToken1 = createAtom<Mint | undefined>(RAYMint)
export const swapToken2 = createAtom<Mint | undefined>(SOLMint)
export const swapTokenAmount1 = createAtom<Numberish | undefined>()
export const swapTokenAmount2 = createAtom<Numberish | undefined>()

/** ensure even during different component will clac only once in the whole app */
function createAtomEffect() {

}
