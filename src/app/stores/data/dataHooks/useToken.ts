import { isString, shrinkFn } from '@edsolater/fnkit'
import { Accessor, createEffect, createMemo, createSignal } from 'solid-js'
import { Accessify } from '../../../../packages/pivkit'
import { Token, emptyToken } from '../../../utils/dataStructures/Token'
import { Mint } from '../../../utils/dataStructures/type'
import { getByKey, hasKey } from '../../../utils/dataTransmit/getItems'
import { store } from '../dataStore'

/** easy to use & easy to read
 * whether loaded or not, it will return a token (even emptyToken)
 */
export function useToken(
  v?: Accessify<Mint> | Accessify<Token> | Accessify<Mint | Token>,
): Accessor<Token> /* TODO: better to  Just return Token object */ {
  const intputedToken = createMemo(() => {
    const inputParam = shrinkFn(v)
    if (isString(inputParam)) {
      const mint = inputParam
      return getByKey(store.tokens, mint)
    } else {
      const token = inputParam
      return token
    }
  })

  /** every use Token should give back a solidjs store */
  const [storeToken, setStoreToken] = createSignal<Token>(intputedToken() ?? emptyToken)

  /**
   * can detect whether token is default empty token
   */
  const isTokenLoaded = createMemo(() => {
    const inputParam = shrinkFn(v)
    const mint = isString(inputParam) ? inputParam : inputParam?.mint
    return hasKey(store.tokens, mint)
  })

  createEffect(() => {
    const newToken = intputedToken()
    console.log('intputedToken: ', intputedToken)
    if (newToken) {
      setStoreToken(newToken)
    }
  })
  createEffect(() => {
    console.log('v: ', v)
  })

  return storeToken
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
