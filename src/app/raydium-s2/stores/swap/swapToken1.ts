import { createStoreAtom } from '../../../../packages/pivkit/hooks/createStoreAtom'
import { RAYMint, USDCMint } from '../../configs/wellknowns'
import { useDataStore } from '../data/store'

export const useSwapToken1 = () =>
  createStoreAtom(
    () => {
      const dataStore = useDataStore()
      return dataStore.allTokens?.find((t) => t.mint === RAYMint)
    },
    {
      onFirstAccess(getter, setter) {
        setTimeout(() => {
          const dataStore = useDataStore()
          const USDC = dataStore.allTokens?.find((t) => t.mint === USDCMint)
          console.log('2: ', dataStore, USDC)
          if (USDC) {
            console.log('setter: ', setter)
            setter(USDC) // FIXME 2023-04-23: why not update?
          }
        }, 1000)
      }
    }
  )
