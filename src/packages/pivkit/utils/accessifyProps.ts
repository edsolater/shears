import { AnyFn, AnyObj, isFunction, isObject, shrinkFn } from '@edsolater/fnkit'
import { ValidController } from '../../piv/types/tools'

/**
 * propertyName start with 'on' or end with 'Fn' will treate as origin
 */
export type Accessify<P extends Record<string, any>, Controller extends ValidController = {}> = {
  [K in keyof P]: K extends `on${string}` | `${string}Fn`
    ? FixFunctionControllerParam<P[K], Controller>
    : P[K] | ((controller: Controller) => P[K])
}

export type DeAccessify<P> = P extends Accessify<infer A, any> ? A : P

type FixFunctionControllerParam<F, Controller extends ValidController> = F extends (
  ...args: [infer P1, ...infer PS]
) => infer R
  ? (...args: [controller: P1 extends AnyObj | unknown ? P1 & { controller: Controller } : P1, ...rest: PS]) => R
  : never
/**
 * propertyName start with 'on' will treate as function
 */
export function useAccessifiedProps<P extends Record<string, any>, Controller extends ValidController = {}>(
  props: P,
  controller?: Controller,
  noNeedAccessifyProps?: string[]
): DeAccessify<P> {
  const accessifiedProps = Object.defineProperties(
    {},
    Reflect.ownKeys(props).reduce((acc: any, key: any) => {
      acc[key] = {
        enumerable: true,
        get() {
          const v = props[key]
          if (noNeedAccessifyProps?.includes(key)) {
            return v
          } else if (key.startsWith('on')) {
            if (controller && isFunction(v)) {
              return fixFunctionParams(v, [{ controller }])
            } else {
              return v
            }
          } else {
            return shrinkFn(v, [controller])
          }
        }
      }
      return acc
    }, {} as PropertyDescriptorMap)
  ) as DeAccessify<P>
  return accessifiedProps
}

function fixFunctionParams<F extends AnyFn, P extends any[] = Parameters<F>>(originalFn: F, preParams: P): F {
  // @ts-expect-error no need to check
  return {
    [originalFn.name]: (...args: unknown[]) => originalFn(...shallowMergeTwoArray(preParams, args))
  }[originalFn.name]
}

// TODO: move to fnkit
function shallowMergeTwoArray(old: any[], arr2: any[]) {
  return Array.from({ length: Math.max(old.length, arr2.length) }, (_, i) => {
    const va = old[i]
    const vb = arr2[i]
    if (isObject(va) && isObject(vb)) {
      return { ...va, ...vb }
    } else {
      return vb ?? va
    }
  })
}
