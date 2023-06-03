import { notZero } from '@edsolater/fnkit'
import { createEffect, onCleanup } from 'solid-js'
import { StoreAtom, createStoreAtom } from '../../../../../packages/pivkit/hooks/createStoreAtom'
import { RAYMint, SOLMint } from '../../../configs/wellknowns'
import { TokenAmount } from '../../../utils/dataStructures/TokenAmount'
import { Mint, Numberish } from '../../../utils/dataStructures/type'
import { getToken } from '../methods/getToken'
import { calculatedSwapRouteInfos_main } from '../utils/calculateSwapRouteInfos_main'

export const useSwapToken1 = createStoreAtom<Mint | undefined>(RAYMint)
export const useSwapToken2 = createStoreAtom<Mint | undefined>(SOLMint)
export const useSwapTokenAmount1 = createStoreAtom<Numberish | undefined>()
export const useSwapTokenAmount2 = createStoreAtom<Numberish | undefined>()

type AtomAccessor<Atom extends StoreAtom<any>> = ReturnType<Atom>[0]
type AtomSetter<Atom extends StoreAtom<any>> = ReturnType<Atom>[1]

/**
 * storeState:
 * - {@link useSwapToken1}
 * - {@link useSwapToken2}
 * - {@link useSwapTokenAmount1}
 * - {@link useSwapTokenAmount2}
 */
export function useSwapAmountCalculator() {
  const [token1, setToken1] = useSwapToken1()
  const [token2, setToken2] = useSwapToken2()
  const [amount1, setAmount1] = useSwapTokenAmount1()
  const [amount2, setAmount2] = useSwapTokenAmount2()

  // preflight
  createEffect(() => {
    const inputToken = getToken(token1())
    const outputToken = getToken(token2())
    if (!inputToken) return
    if (!outputToken) return
    const inputAmount: TokenAmount = { token: inputToken, amount: 1 }

    const subscribable = calculatedSwapRouteInfos_main({
      input: inputToken,
      inputAmount,
      output: outputToken,
    })
    onCleanup(subscribable.abort)
    const s = subscribable.subscribe((info) => {
      if (!info) return
      const { bestResult } = info
      s.unsubscribe()
    })
  })

  // swap calc
  createEffect(() => {
    const inputToken = getToken(token1())
    const outputToken = getToken(token2())
    const amount = amount1()

    if (!inputToken) return
    if (!outputToken) return
    if (!amount) return
    const inputAmount: TokenAmount = { token: inputToken, amount }
    const subscribable = calculatedSwapRouteInfos_main({
      input: inputToken,
      inputAmount,
      output: outputToken,
    })

    onCleanup(subscribable.abort)
    subscribable.subscribe((info) => {
      if (!info) return
      const { bestResult } = info
      const amount = bestResult?.amountOut.amount
      if (notZero(amount)) setAmount2(amount)
    })
  })
}

/** ensure even during different component will clac only once in the whole app */
function createStoreEffect() {}
