import { isString } from '@edsolater/fnkit'
import { createEffect, createMemo } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Accessify, deAccessify } from '../../../../packages/pivkit'
import { Token, emptyToken, isToken } from '../../../utils/dataStructures/Token'
import { store } from '../dataStore'

/** easy to use & easy to read */
export function useToken(options?: { mint?: Accessify<string | Token> | undefined }) {
  const intputedToken = createMemo(() => {
    const mintValue = deAccessify(options?.mint)
    if (isString(mintValue)) {
      const dataStoreToken = store.tokens?.[mintValue]
      return dataStoreToken
    } else if (isToken(mintValue)) {
      return mintValue
    }
  })

  const [storeToken, setStoreToken] = createStore<Token>(intputedToken() ?? emptyToken)

  createEffect(() => {
    const newToken = intputedToken()
    if (newToken) {
      setStoreToken(newToken)
    }
  })

  return { token: storeToken }
}
