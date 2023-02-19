export type DesymbolizeProps<T extends object> = {
  [K in keyof T]: T[K] extends () => infer F ? F : undefined
}
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
