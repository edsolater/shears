import { AnyObj } from '@edsolater/fnkit'

/**
 * will return a proxy to access only in runtime
 * @param original only accessed in runtime
 * @param shallowCopy only accessed in runtime
 * @returns a proxy
 */
export function objectMerge<T extends AnyObj, U extends AnyObj>(original: T, shallowCopy: U): T & U {
  return new Proxy(original, {
    get(target, key) {
      return key in target ? target[key] : shallowCopy[key]
    }
  }) as T & U
}
