import { createEffect } from 'solid-js'
import { createOnFirstAccess } from '../../../../../packages/pivkit'
import { DataStore } from '../store'
import { loadTokenPrice } from './loadTokenPrice'

export const onAccessTokensPrice = createOnFirstAccess<DataStore>(['prices'], (store) => {
  createEffect(() => {
    const tokens = store.allTokens
    if (tokens?.length) {
      loadTokenPrice(store, tokens)
    }
  })
})
