import { isString, shrinkFn } from '@edsolater/fnkit'
import { createMemo } from 'solid-js'
import { Accessify, createSmartStore } from '@edsolater/pivkit'
import { Token, emptyToken } from '../../../utils/dataStructures/Token'
import { Mint } from '../../../utils/dataStructures/type'
import { get, has } from '../../../../packages/fnkit/itemMethods'
import { store } from '../store'

export type UseTokenParam = Accessify<Mint> | Accessify<Token> | Accessify<Mint | Token>

/** 
 * easy to use & easy to read
 * turn a short info (only token'mint) into rich
 * whether loaded or not, it will return a token (even emptyToken)
 */
export function useToken(v?: UseTokenParam): Token {
  const intputedToken = createMemo(() => {
    const inputParam = shrinkFn(v)
    if (isString(inputParam)) {
      const mint = inputParam
      return get(store.tokens, mint)
    } else {
      const token = inputParam
      return token
    }
  })

  /** every use Token should give back a solidjs store */
  const { store: storeToken} = createSmartStore(
    () => (intputedToken() ?? emptyToken())
  )

  /**
   * can detect whether token is default empty token
   */
  const isTokenLoaded = createMemo(() => {
    const inputParam = shrinkFn(v)
    const mint = isString(inputParam) ? inputParam : inputParam?.mint
    return has(store.tokens, mint)
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
