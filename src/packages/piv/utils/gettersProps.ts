import { isFunction } from '@edsolater/fnkit'

export type GettersProps<T extends object> = {
  [K in keyof T]: T[K] extends () => infer F ? F : undefined
}

/**
 * original props is getters, it is not easy to consider with solid's signal
 * so make it signal to let user **manually** invoke the function will be better
 */
export function gettersProps<T extends object>(props: T): GettersProps<T> {
  return Object.defineProperties(
    {},
    Reflect.ownKeys(props).reduce((acc, key) => {
      acc[key] = {
        enumerable: true,
        get() {
          //@ts-expect-error no need type check
          const v = props[key]
          return v?.()
        }
      }
      return acc
    }, {} as PropertyDescriptorMap)
  ) as GettersProps<T>
}
