import { createEffect } from 'solid-js'
import { StoreAtom, createStoreAtom } from '../../../../../packages/pivkit/hooks/createStoreAtom'
import { RAYMint, SOLMint, USDCMint } from '../../../configs/wellknowns'
import { useDataStore } from '../store'

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
    // TODO: how to use webwork for it's calculation?
    // const info
  })
}

/**will clac on once in the same time */
function createStoreEffect() {}
