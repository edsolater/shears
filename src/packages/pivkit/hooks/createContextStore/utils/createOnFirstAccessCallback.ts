import { isObject } from '@edsolater/fnkit'
import { OnFirstAccessCallback, Store } from '../type'

/**
 * for better type
 */
export function createOnFirstAccessCallback<T extends Record<string, any>>(
  propertyName: keyof T,
  cb: OnFirstAccessCallback<T>
): { propertyName: keyof T; cb: OnFirstAccessCallback<T> } {
  return { propertyName, cb: cb as any /*  no need to check type here */ }
}

/**
 * for type utils
 */
export function createStoreDefaultState<T extends Record<string, any>>(
  defaultState: Partial<T> | ((store: Store<T>) => Partial<T>)
): (store: Store<T>) => Partial<T> {
  return isObject(defaultState) ? () => defaultState as Partial<T> : defaultState
}
