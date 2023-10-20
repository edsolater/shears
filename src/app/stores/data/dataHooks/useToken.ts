import { isString } from '@edsolater/fnkit'
import { createEffect, createMemo, createSignal } from 'solid-js'
import { Accessify, deAccessify } from '../../../../packages/pivkit'
import { Token, emptyToken, isToken } from '../../../utils/dataStructures/Token'
import { getByKey } from '../../../utils/dataTransmit/getItems'
import { store } from '../dataStore'

/** easy to use & easy to read
 * whether loaded or not, it will return a token (even emptyToken)
 */
export function useToken(options?: { mint?: Accessify<string | Token> | undefined }) {
  const intputedToken = createMemo(() => {
    const mintValue = deAccessify(options?.mint)
    if (isString(mintValue)) {
      const dataStoreToken = getByKey(store.tokens, mintValue)
      return dataStoreToken
    } else if (isToken(mintValue)) {
      return mintValue
    }
  })

  /** every use Token should give back a solidjs store */
  const [storeToken, setStoreToken] = createSignal<Token>(intputedToken() ?? emptyToken)

  /**
   * can detect whether token is default empty token
   */
  const isTokenLoaded = createMemo(() => {
    const mintValue = deAccessify(options?.mint)
    if (isString(mintValue)) {
      const dataStoreToken = getByKey(store.tokens, mintValue)
      if (dataStoreToken) return true
    }
    return false
  })

  createEffect(() => {
    const newToken = intputedToken()
    if (newToken) {
      setStoreToken(newToken)
    }
  })

  return { token: storeToken, isTokenLoaded }
}
