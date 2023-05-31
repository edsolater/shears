import { Token } from '../../../utils/dataStructures/Token'
import { Numberish } from '../../../utils/dataStructures/type'

export function txSwap_getInnerTransaction() {
  throw new Error('not implemented')
}
export interface TxSwapOptions {
  coin1: Token
  coin2: Token
  amount1: Numberish
  amount2: Numberish
  direction: '1 → 2' | '2 → 1'
}
