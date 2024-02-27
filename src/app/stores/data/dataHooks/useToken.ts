import { cloneObject, isString, shrinkFn } from '@edsolater/fnkit'
import { createEffect, createMemo } from 'solid-js'
import { Accessify, createSmartStore } from '@edsolater/pivkit'
import { Token, emptyToken, genEmptyToken } from '../../../utils/dataStructures/Token'
import { Mint } from '../../../utils/dataStructures/type'
import { get, has } from '../../../../packages/fnkit/itemMethods'
import { shuck_tokens, store } from '../store'
import { useShuckValue } from '../../../../packages/conveyor/solidjsAdapter/useShuck'
import { createStore, reconcile } from 'solid-js/store'

export type UseTokenParam = Accessify<Mint> | Accessify<Token> | Accessify<Mint | Token>

/**
 * easy to use & easy to read
 * turn a short info (only token'mint) into rich
 * whether loaded or not, it will return a token (even emptyToken)
 *
 * it use solidjs's createStore to store a object data
 */
export function useToken(input?: UseTokenParam): Token {
  const tokens = useShuckValue(shuck_tokens)
  const intputToken = createMemo(() => {
    const inputParam = shrinkFn(input)
    if (isString(inputParam)) {
      const mint = inputParam
      return get(tokens(), mint)
    } else {
      const token = inputParam
      return token
    }
  })
  const [outputToken, setOutputToken] = createStore<Token>(intputToken() ?? cloneObject(emptyToken))
  createEffect(() => {
    const newToken = intputToken()
    if (newToken && newToken !== outputToken) {
      setOutputToken(reconcile(newToken, { key: 'mint' }))
    }
  })
  return outputToken
}

// /** 🤔is it neccessory? just useTokenInfo is ok? */
// type RawTokenInfo = {
//   token: Token
//   isTokenLoaded: boolean
// }
// /** 🤔is it neccessory? just useTokenInfo is ok? */
// function tokenInfo(mint: Mint): RawTokenInfo
// function tokenInfo(token: Token): RawTokenInfo
// function tokenInfo(v: Mint | Token): RawTokenInfo {
//   return untrack(() => {
//     const isMint = isString(v)
//     if (isMint) {
//       const rv = deeplyDeAccessify(useToken({ mint: v }))
//       return rv
//     } else {
//       return deeplyDeAccessify(useToken({ token: v }))
//     }
//   })
// }

// /**
//  * recursively deAccessify object
//  * @param o target object
//  * @param controller [optional] controller
//  * @returns a pure object
//  */
// function deeplyDeAccessify<T extends object>(o: T, controller?: object): { [K in keyof T]: DeAccessify<T[K]> } {
//   const result = {}
//   for (const [k, v] of Object.entries(o)) {
//     if (isObject(v)) {
//       result[k] = deeplyDeAccessify(v, controller)
//     } else {
//       result[k] = deAccessify(v, controller)
//     }
//   }
//   return mergeObjects(o, result) as { [K in keyof T]: DeAccessify<T[K]> }
// }
