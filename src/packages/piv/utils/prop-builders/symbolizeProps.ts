import { isArray, MayArray, AddDefaultProperties } from '@edsolater/fnkit'
import { mergeProps } from 'solid-js'

export type SymbolizeProps<T extends object> = { [K in keyof T]-?: () => T[K] }
export function symbolizeProps<T extends object, U extends Partial<T>>(
  props: T,
  options?: { defaultProps?: U }
): SymbolizeProps<AddDefaultProperties<T, U>>
export function symbolizeProps<T extends object, U extends Partial<T>, W extends Partial<T>>(
  props: T,
  options?: { defaultProps?: [U, W] }
): SymbolizeProps<AddDefaultProperties<T, U & W>>
export function symbolizeProps<T extends object, U extends Partial<T>, W extends Partial<T>, X extends Partial<T>>(
  props: T,
  options?: { defaultProps?: [U, W, X] }
): SymbolizeProps<AddDefaultProperties<T, U & W & X>>
export function symbolizeProps<
  T extends object,
  U extends Partial<T>,
  W extends Partial<T>,
  X extends Partial<T>,
  Y extends Partial<T>
>(props: T, options?: { defaultProps?: [U, W, X, Y] }): SymbolizeProps<AddDefaultProperties<T, U & W & X & Y>>
export function symbolizeProps<T extends object, X extends Partial<T>[]>(
  props: T,
  options?: { defaultProps?: X }
): SymbolizeProps<AddDefaultProperties<T, X[number]>> {
  const result = isArray(options?.defaultProps)
    ? mergeProps(...options?.defaultProps!, props)
    : (mergeProps(options?.defaultProps, props) as SymbolizeProps<T>)
  const symbolized = new Proxy(result, {
    get: (target, p, receiver) => (() => Reflect.get(target, p, receiver)) ?? (() => {})
  }) as any
  return symbolized
}


