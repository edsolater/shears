import { AnyObj, shrinkFn, unifyItem } from '@edsolater/fnkit'
import { ValidController } from '../../piv/types/tools'

/**
 * propertyName start with 'on' or end with 'Fn' will treate as origin
 */
export type Accessify<P extends Record<string, any>, Controller extends ValidController = {}> = {
  [K in keyof P]: K extends `on${string}` | `${string}Fn` ? P[K] : P[K] | ((controller: Controller) => P[K])
}

export type DeAccessify<P extends AnyObj> = P extends Accessify<infer R> ? R : P

/**
 * propertyName start with 'on' or end with 'Fn' will treate as origin
 */
export function useAccessifiedProps<P extends Record<string, any>, Controller extends ValidController = {}>(
  props: P,
  controller?: Controller
): DeAccessify<P> {
  const accessifiedProps = Object.defineProperties(
    {},
    Reflect.ownKeys(props).reduce((acc: any, key: any) => {
      acc[key] = {
        enumerable: true,
        get() {
          if (key.startsWith('on') || key.endsWith('Fn')) {
            return props[key]
          } else {
            return shrinkFn(props[key], [controller])
          }
        }
      }
      return acc
    }, {} as PropertyDescriptorMap)
  ) as DeAccessify<P>
  return accessifiedProps
}
