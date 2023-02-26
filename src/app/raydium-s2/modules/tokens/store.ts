import { createContextStore } from '@edsolater/pivkit'
import { defaultTokenStore, initAllTokens } from './store_tokens'

export const [DataStoreProvider, useDataStore] = createContextStore(defaultTokenStore, { onFirstAccess: [initAllTokens] })
