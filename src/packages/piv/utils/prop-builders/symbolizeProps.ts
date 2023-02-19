import { DeMayArray, isArray, MayArray } from '@edsolater/fnkit'
import { mergeProps } from 'solid-js'

export type AddDefault<T extends object, D extends object> = {
  [K in keyof T]: K extends keyof D ?  NonNullable<T[K]> : T[K]
} & {
  [K in keyof D]: K extends keyof T ? NonNullable<T[K]> : D[K]
}
// export type AddDefault<T extends object, D extends object> = {
//   [K in keyof T]: K extends keyof D ? (D[K] extends undefined | null ? T[K] : NonNullable<T[K]>) : T[K]
// }

export type SymbolizeProps<T extends object> = { [K in keyof T]-?: () => T[K] }
export function symbolizeProps<T extends object, U extends Partial<T>>(
  props: T,
  options?: { defaultProps?: U }
): SymbolizeProps<AddDefault<T, U>>
export function symbolizeProps<T extends object, U extends Partial<T>, W extends Partial<T>>(
  props: T,
  options?: { defaultProps?: [U, W] }
): SymbolizeProps<AddDefault<T, U & W>>
export function symbolizeProps<T extends object, U extends Partial<T>, W extends Partial<T>, X extends Partial<T>>(
  props: T,
  options?: { defaultProps?: [U, W, X] }
): SymbolizeProps<AddDefault<T, U & W & X>>
export function symbolizeProps<T extends object, U extends Partial<T>, W extends Partial<T>, X extends Partial<T>, Y extends Partial<T>>(
  props: T,
  options?: { defaultProps?: [U, W, X, Y] }
): SymbolizeProps<AddDefault<T, U & W & X & Y>>
export function symbolizeProps<T extends object, X extends Partial<T>[]>(
  props: T,
  options?: { defaultProps?: X }
): SymbolizeProps<AddDefault<T, X[number]>> {
  const result = isArray(options?.defaultProps)
    ? mergeProps(...options?.defaultProps!, props)
    : (mergeProps(options?.defaultProps, props) as SymbolizeProps<T>)
  const symbolized = new Proxy(result, {
    get: (target, p, receiver) => (() => Reflect.get(target, p, receiver)) ?? (() => {})
  }) as any
  return symbolized
}

export type DesymbolizeProps<T extends object> = { [K in keyof T]: T[K] extends () => infer F ? F : undefined }
export function desymbolizeProps<T extends object>(props: T): DesymbolizeProps<T> {
  return Object.defineProperties(
    {},
    Reflect.ownKeys(props).reduce((acc, key) => {
      acc[key] = {
        enumerable: true,
        get() {
          return props[key]?.()
        }
      }
      return acc
    }, {} as PropertyDescriptorMap)
  ) as DesymbolizeProps<T>
}
