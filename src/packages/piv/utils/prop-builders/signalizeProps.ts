import { AddDefaultProperties, isArray } from '@edsolater/fnkit'
import { mergeProps } from 'solid-js'

export type SignalizeProps<T extends object> = { [K in keyof T]-?: () => T[K] }

export function signalizeProps<T extends object, U extends Partial<T>>(
  props: T,
  options?: { defaultProps?: U }
): SignalizeProps<AddDefaultProperties<T, U>>
export function signalizeProps<T extends object, U extends Partial<T>, W extends Partial<T>>(
  props: T,
  options?: { defaultProps?: [U, W] }
): SignalizeProps<AddDefaultProperties<T, U & W>>
export function signalizeProps<T extends object, U extends Partial<T>, W extends Partial<T>, X extends Partial<T>>(
  props: T,
  options?: { defaultProps?: [U, W, X] }
): SignalizeProps<AddDefaultProperties<T, U & W & X>>
export function signalizeProps<
  T extends object,
  U extends Partial<T>,
  W extends Partial<T>,
  X extends Partial<T>,
  Y extends Partial<T>
>(props: T, options?: { defaultProps?: [U, W, X, Y] }): SignalizeProps<AddDefaultProperties<T, U & W & X & Y>>
export function signalizeProps<T extends object, X extends Partial<T>[]>(
  props: T,
  options?: { defaultProps?: X }
): SignalizeProps<AddDefaultProperties<T, X[number]>> {
  const result = isArray(options?.defaultProps)
    ? mergeProps(...options?.defaultProps!, props)
    : (mergeProps(options?.defaultProps, props) as SignalizeProps<T>)
  const signalized = new Proxy(result, { // result contain keys info 
    get: (target, p, receiver) => (() => Reflect.get(target, p, receiver)) ?? (() => {})
  }) as any
  return signalized
}
