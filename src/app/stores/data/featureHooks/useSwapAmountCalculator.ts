import { notZero } from '@edsolater/fnkit'
import { createEffect } from 'solid-js'
import { TokenAmount } from '../../../utils/dataStructures/TokenAmount'
import { getToken } from '../methods/getToken'
import { calculatedSwapRouteInfos_main } from '../utils/calculateSwapRouteInfos_main'
import { swapToken1, swapToken2, swapTokenAmount1, swapTokenAmount2 } from '../atoms/swap'
import { useAtom } from '../../../../packages/pivkit'

/**
 * storeState:
 * - {@link swapToken1}
 * - {@link swapToken2}
 * - {@link swapTokenAmount1}
 * - {@link swapTokenAmount2}
 */
export function useSwapAmountCalculator() {
  const { get: token1, set: setToken1 } = useAtom(swapToken1)
  const { get: token2, set: setToken2 } = useAtom(swapToken2)
  const { get: amount1, set: setAmount1 } = useAtom(swapTokenAmount1)
  const { get: amount2, set: setAmount2 } = useAtom(swapTokenAmount2)

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

    subscribable.subscribe((info) => {
      if (!info) return
      const { bestResult } = info
      const tokenAmount = bestResult?.amountOut.amount
      const n = tokenAmount
      if (notZero(n)) setAmount2(n)
    })
  })
}
