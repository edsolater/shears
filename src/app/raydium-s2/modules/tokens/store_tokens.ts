import { createStore } from 'solid-js/store'
import { TokenJson } from 'test-raydium-sdk-v2'
import { getTokens } from '../$worker/worker_receiver'

type TokenStore = {
  $hasInited: boolean
  $loading: boolean
  allTokens: TokenJson[]
}

const defaultTokenStore = { $hasInited: false, $loading: false, allTokens: [] } satisfies TokenStore

/**
 * @todo it's should be a context. thus, `useContext(sdkToken)` is better to read.
 * solidjs store
 */
export function useSDKToken() {
  const [store, setStore] = createStore<TokenStore>(defaultTokenStore)
  const initLoadTokens = async () => {
    setStore({ $loading: true })
    const allTokens = await getTokens()
    setStore({ $hasInited: true, $loading: false, allTokens })
  }
  const allTokens = () => {
    if (!store.$hasInited && !store.$loading) {
      initLoadTokens()
    }
    return store.allTokens
  }
  const setAllTokens = (newTokens: TokenJson[]) => setStore({ allTokens: newTokens })
  return {
    allTokens,
    setAllTokens,
    tokensCount: () => allTokens().length,
    isLoading: () => store.$loading
  }
}
