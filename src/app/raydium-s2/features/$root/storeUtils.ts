import { createStore } from 'solid-js/store'
import { TokenJson } from 'test-raydium-sdk-v2'
import { getRaydiumSDKRoot } from './utils/getRaydiumSDKRoot'

type TokenStore = {
  $inited: boolean
  allTokens: TokenJson[]
}

const defaultTokenStore = { $inited: false, allTokens: [] } satisfies TokenStore

/** async */
export async function getRaydiumSDKTokens() {
  return getRaydiumSDKRoot().then((sdk) => sdk.token.allTokens)
}

/**
 * @todo it's should be a context. thus, `useContext(sdkToken)` is better to read.
 */
export function useSDKToken() {
  const [store, setStore] = createStore<TokenStore>(defaultTokenStore)
  const initLoadTokens = async () => {
    const allTokens = await getRaydiumSDKTokens()
    setStore({ $inited: true, allTokens })
  }
  const allTokens = () => {
    if (!store.$inited) {
      initLoadTokens()
    }
    return store.allTokens
  }

  const setAllTokens = (newTokens: TokenJson[]) => setStore({ allTokens: newTokens })
  return { allTokens, setAllTokens, tokensCount: () => allTokens().length }
}
