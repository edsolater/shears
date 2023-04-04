import { AnyFn, AnyObj, isFunction, isObject, mergeObjectsWithConfigs, shrinkFn, unifyItem } from '@edsolater/fnkit'
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
            const v = props[key]
            if (controller && isFunction(v)) {
              return predefineFunctionParams(v, [controller])
            } else {
              return v
            }
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

function predefineFunctionParams<F extends AnyFn, P extends any[] = Parameters<F>>(originalFn: F, preParams: P): F {
  // @ts-expect-error no need to check
  return {
    [originalFn.name]: (...args: unknown[]) => originalFn(...shallowMergeTwoArray(preParams, args))
  }[originalFn.name]
}

// TODO: move to fnkit
function shallowMergeTwoArray(old: any[], arr2: any[]) {
  return Array.from({ length: Math.max(old.length, arr2.length) }, (_, i) => {
    const va = arr2[i]
    const vb = old[i]
    if (isObject(va) && isObject(vb)) {
      return { ...va, ...vb }
    } else {
      return va ?? vb
    }
  })
}
