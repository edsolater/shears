import { createStore } from 'solid-js/store'
import { TokenJson } from 'test-raydium-sdk-v2'
import { getRaydiumSDKRoot, getRaydiumSDKTokens } from './utils/getRaydiumSDKRoot'

type TokenStore = {
  $inited: boolean
  allTokens: TokenJson[]
}

const defaultTokenStore = { $inited: false, allTokens: [] } satisfies TokenStore

export function useSDKToken() {
  const [store, setStore] = createStore<TokenStore>(defaultTokenStore)

  const initLoadTokens = async () => {
    console.log('load tokens')
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
  allTokens.setAllTokens = setAllTokens

  return { allTokens }
}
