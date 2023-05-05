import { createEffect } from 'solid-js'
import { StoreAtom, createStoreAtom } from '../../../../../packages/pivkit/hooks/createStoreAtom'
import { RAYMint, SOLMint, USDCMint } from '../../../configs/wellknowns'
import { useDataStore } from '../store'
import { calculateSwapRouteInfos } from '../utils/calculateGetSwapInfos'
import { getConnection } from '../../../utils/common/getConnection'
import { getToken } from '../methods/getToken'
import { TokenAmount } from '../../../utils/dataStructures/TokenAmount'

export const useSwapToken1 = createStoreAtom(RAYMint, {
  onFirstAccess(getter, setter) {
    let hasLoaded: boolean = false
    setInterval(() => {
      const dataStore = useDataStore()
      const USDC = dataStore.allTokens?.find((t) => t.mint === USDCMint)
      if (USDC && hasLoaded === false) {
        hasLoaded = true

        setter(USDC.mint) // FIXME 2023-04-23: why not update?
      }
    }, 1000)
  }
})

export const useSwapToken2 = createStoreAtom(SOLMint)
export const useSwapTokenAmount1 = createStoreAtom<number | string | undefined>()
export const useSwapTokenAmount2 = createStoreAtom<number | string | undefined>()

type AtomAccessor<Atom extends StoreAtom<any>> = ReturnType<Atom>[0]
type AtomSetter<Atom extends StoreAtom<any>> = ReturnType<Atom>[1]

export function useSwapAmountCalculator() {
  const [token1, setToken1] = useSwapToken1()
  const [token2, setToken2] = useSwapToken2()
  const [amount1, setAmount1] = useSwapTokenAmount1()
  const [amount2, setAmount2] = useSwapTokenAmount2()

  createEffect(() => {
    const inputToken = getToken(token1())
    const outputToken = getToken(token2())
    const amount = amount1()

    if (!inputToken) return
    if (!outputToken) return
    if (!amount) return
    const inputAmount: TokenAmount = { token: inputToken, amount }
    calculateSwapRouteInfos({
      connection: getConnection('https://rpc.asdf1234.win'), // TEMP for DEV
      slippageTolerance: 0.05,
      input: inputToken,
      inputAmount,
      output: outputToken
    }).then((info) => {
      if (!info) return
      const { bestResult } = info
      console.log('bestResult: ', bestResult)
    })
  })
}

/** ensure even during different component will clac only once in the whole app */
function createStoreEffect() {}
