import { isString, shrinkFn, type Subscribable } from '@edsolater/fnkit'
import type { Accessify } from '@edsolater/pivkit'
import { createStore } from 'solid-js/store'
import { get } from '@edsolater/fnkit'
import { defaultToken, errorToken, loadingToken, type Token } from '../../../utils/dataStructures/Token'
import type { Mint } from '../../../utils/dataStructures/type'
import { shuck_isTokenListLoading, shuck_isTokenListLoadingError, shuck_tokens } from '../store'

export type UseTokenParam = Accessify<Mint> | Accessify<Token> | Accessify<Mint | Token>

/**
 * use this in .tsx
 * easy to use & easy to read
 * turn a short info (only token'mint) into rich
 * whether loaded or not, it will return a token (even emptyToken)
 *
 * it use solidjs's createStore to store a object data
 */
export function useToken(input?: UseTokenParam): Token {
  const outputTokenSubscribable = getToken(input)
  const [outputToken, setOutputToken] = createStore<Token>(outputTokenSubscribable())
  outputTokenSubscribable.subscribe((newToken) => {
    if (newToken !== outputToken) {
      setOutputToken(newToken)
    }
  })
  return outputToken
}

/**
 * use this in .ts
 */
export function getToken(input?: UseTokenParam): Subscribable<Token> {
  const inputToken = shuck_tokens.pipe((tokens) => {
    const inputParam = shrinkFn(input)
    if (isString(inputParam)) {
      const mint = inputParam
      return get(tokens, mint)
    } else {
      const token = inputParam
      return token
    }
  })

  const outputToken = inputToken.pipe((newToken) => newToken ?? defaultToken())
  function updateToken() {
    const newToken = inputToken()
    if (newToken) {
      if (newToken !== outputToken()) {
        outputToken.set(newToken)
      }
    } else if (shuck_isTokenListLoading()) {
      outputToken.set(loadingToken)
    } else if (shuck_isTokenListLoadingError()) {
      outputToken.set(errorToken)
    }
  }
  inputToken.subscribe(updateToken)
  shuck_isTokenListLoading.subscribe(updateToken)
  shuck_isTokenListLoadingError.subscribe(updateToken)

  return outputToken
}

/** not reactable!! use this in .tsx|.ts  */
export function getCurrentToken(input?: UseTokenParam): Token | undefined {
  const outputTokenSubscribable = getToken(input)
  return outputTokenSubscribable()
}
