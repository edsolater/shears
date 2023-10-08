import { notZero } from '@edsolater/fnkit'
import { createEffect } from 'solid-js'
import { TokenAmount } from '../../../utils/dataStructures/TokenAmount'
import { getToken } from '../methods/getToken'
import { calculatedSwapRouteInfos_main } from '../utils/calculateSwapRouteInfos_main'
import { swapToken1Atom, swapToken2Atom, swapTokenAmount1Atom, swapTokenAmount2Atom } from '../atoms'
import { useAtom } from '../../../../packages/pivkit'

/**
 * storeState:
 * - {@link swapToken1Atom}
 * - {@link swapToken2Atom}
 * - {@link swapTokenAmount1Atom}
 * - {@link swapTokenAmount2Atom}
 */
export function useSwapAmountCalculator() {
  const { get: token1, set: setToken1 } = useAtom(swapToken1Atom)
  const { get: token2, set: setToken2 } = useAtom(swapToken2Atom)
  const { get: amount1, set: setAmount1 } = useAtom(swapTokenAmount1Atom)
  const { get: amount2, set: setAmount2 } = useAtom(swapTokenAmount2Atom)

  // preflight
  createEffect(() => {
    console.log('preflight')
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
    const s = subscribable.subscribe((info) => {
      if (!info) return
      const { bestResult } = info
      s.unsubscribe()
    })
  })

  // swap calc
  createEffect(() => {
    console.log('swap calc')
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

    subscribable.subscribe((info) => {
      if (!info) return
      const { bestResult } = info
      const tokenAmount = bestResult?.amountOut.amount
      const n = tokenAmount
      if (notZero(n)) setAmount2(n)
    })
  })
}
