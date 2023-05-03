import { createStoreAtom } from '../../../../../packages/pivkit/hooks/createStoreAtom'
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
