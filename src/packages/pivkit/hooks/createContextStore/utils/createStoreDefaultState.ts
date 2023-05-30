import { isObject } from '@edsolater/fnkit'
import { Store } from '../type'

/**
 * type utils function
 */

export function createStoreDefault<T extends Record<string, any>>(
  defaultState: Partial<T> | ((store: Store<T>) => Partial<T>),
): (store: Store<T>) => Partial<T> {
  return isObject(defaultState) ? () => defaultState as Partial<T> : defaultState
}
