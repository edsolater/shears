export type DesignalizeProps<T extends object> = {
  [K in keyof T]: T[K] extends () => infer F ? F : undefined
}

/**
 * original props is getters, it is not easy to consider with solid's signal
 * so make it signal to let user **manually** invoke the function will be better
 */
export function designalizeProps<T extends object>(props: T): DesignalizeProps<T> {
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
  ) as DesignalizeProps<T>
}
