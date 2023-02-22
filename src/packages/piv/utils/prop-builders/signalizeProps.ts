import { AddDefaultProperties, isArray } from '@edsolater/fnkit'
import { mergeProps } from 'solid-js'

export type SignalizeProps<T extends object | undefined> = { [K in keyof T]: () => T[K] }

export function signalizeProps<T extends object | undefined, U extends Partial<T>>(
  props: T,
  options?: { defaultProps?: U }
): SignalizeProps<AddDefaultProperties<NonNullable<T>, U>>
export function signalizeProps<T extends object | undefined, U extends Partial<T>, W extends Partial<T>>(
  props: T,
  options?: { defaultProps?: [U, W] }
): SignalizeProps<AddDefaultProperties<NonNullable<T>, U & W>>
export function signalizeProps<
  T extends object | undefined,
  U extends Partial<T>,
  W extends Partial<T>,
  X extends Partial<T>
>(props: T, options?: { defaultProps?: [U, W, X] }): SignalizeProps<AddDefaultProperties<NonNullable<T>, U & W & X>>
export function signalizeProps<
  T extends object | undefined,
  U extends Partial<T>,
  W extends Partial<T>,
  X extends Partial<T>,
  Y extends Partial<T>
>(
  props: T,
  options?: { defaultProps?: [U, W, X, Y] }
): SignalizeProps<AddDefaultProperties<NonNullable<T>, U & W & X & Y>>
export function signalizeProps<T extends object | undefined, X extends Partial<T>[]>(
  props: T,
  options?: { defaultProps?: X }
): SignalizeProps<AddDefaultProperties<NonNullable<T>, X[number]>> {
  const hasAddDefaulted = isArray(options?.defaultProps)
    ? mergeProps(...options?.defaultProps!, props)
    : (mergeProps(options?.defaultProps, props) as SignalizeProps<T>)
  const signalized = new Proxy(hasAddDefaulted, {
    // result contain keys info
    get: (target, p, receiver) => (p in target ? () => Reflect.get(target, p, receiver) : () => {})
  }) as any
  return signalized
}
