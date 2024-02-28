import { isString, shrinkFn, unifyItem, type AnyObj, Subscribable, createSubscribable } from '@edsolater/fnkit'
import { Accessify } from '@edsolater/pivkit'
import { createEffect, createMemo } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { useShuckValue } from '../../../../packages/conveyor/solidjsAdapter/useShuck'
import { get } from '../../../../packages/fnkit/itemMethods'
import { Token, emptyToken } from '../../../utils/dataStructures/Token'
import { Mint } from '../../../utils/dataStructures/type'
import { shuck_tokens } from '../store'

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

/**
 * use this in .ts
 */
export function getToken(input?: UseTokenParam): Subscribable<Token | undefined> {
  const outputToken = createSubscribable<Token | undefined>()
  shuck_tokens.subscribe((tokens) => {
    const inputParam = shrinkFn(input)
    if (isString(inputParam)) {
      const mint = inputParam
      outputToken.set(get(tokens, mint))
    } else {
      const token = inputParam
      outputToken.set(token)
    }
  })
  return outputToken
}

/** not reactable!! use this in .tsx|.ts  */
export function getCurrentToken(input?: UseTokenParam): Token | undefined {
  const tokens = shuck_tokens()
  const inputParam = shrinkFn(input)
  if (isString(inputParam)) {
    const mint = inputParam
    return get(tokens, mint)
  } else {
    const token = inputParam
    return token
  }
}

// 🔥already in fnkit
/**
 *  shallow clone like {...obj}, but don't access it's getter
 *  @example
 * cloneObject({get a() {return 1}}) //=> {get a() {return 1}}
 */
function cloneObject<T extends AnyObj>(original: T): T {
  return new Proxy(
    {},
    {
      get: (target, key, receiver) =>
        key in target ? Reflect.get(target, key, receiver) : Reflect.get(original, key, receiver),
      has: (target, key) => key in target || key in original,
      set: (target, key, value) => Reflect.set(target, key, value),
      defineProperty: (target, property, attributes) => Reflect.defineProperty(target, property, attributes),
      deleteProperty: (target, property) => Reflect.deleteProperty(target, property),
      getPrototypeOf: () => Object.getPrototypeOf(original),
      ownKeys: (target) => unifyItem(Reflect.ownKeys(target).concat(Reflect.ownKeys(original))),
      // for Object.keys to filter
      getOwnPropertyDescriptor: (target, key) =>
        key in target ? Object.getOwnPropertyDescriptor(target, key) : Object.getOwnPropertyDescriptor(original, key),
    },
  ) as T
}
