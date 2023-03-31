import { createMemo } from 'solid-js'
import { ValidProps } from '../../types/tools'

/**
 * will return a symbol
 */
export function pickPropProperty<T extends ValidProps, U extends keyof T>(props: T, key: U) {
  return createMemo(() => props[key])
}
