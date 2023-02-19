import { mergeProps } from 'solid-js'

export type SymbolizeProps<T extends object> = { [K in keyof T]-?: () => T[K] }
export function symbolizeProps<T extends object>(props: T, options?: { defaultProps?: Partial<T> }): SymbolizeProps<T> {
  const result = mergeProps(options?.defaultProps, props) as SymbolizeProps<T>
  const symbolized = new Proxy(result, {
    get: (target, p, receiver) => (() => Reflect.get(target, p, receiver)) ?? (() => {})
  })
  return symbolized
}

export type DesymbolizeProps<T extends object> = { [K in keyof T]?: T[K] extends () => infer F ? F : undefined }
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
