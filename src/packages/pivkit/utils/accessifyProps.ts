import { AnyFn, AnyObj, isFunction, isObject, isString } from '@edsolater/fnkit'
import { ValidController } from '../../piv/types/tools'

/**
 * propertyName start with 'on' or end with 'Fn' will treate as origin
 */
export type AccessifyProps<P extends AnyObj, Controller extends ValidController | unknown = unknown> = {
  [K in keyof P]: K extends `on${string}` | `domRef` | `controllerRef`
    ? P[K]
    : P[K] extends Accessify<any, any>
    ? P[K]
    : Accessify<P[K], Controller>
}

export type Accessify<V, Controller extends ValidController | unknown = unknown> = V | ((controller: Controller) => V)

export type DeAccessify<V> = V extends Accessify<infer T, any> ? T : V

export type DeAccessifyProps<P> = {
  [K in keyof P]: K extends `on${string}` | `domRef` | `controllerRef`
    ? P[K]
    : P[K] extends Accessify<infer T, any>
    ? T
    : P[K]
}
/**
 * propertyName start with 'on' will treate as function
 */
export function useAccessifiedProps<P extends AnyObj, Controller extends ValidController | unknown = unknown>(
  props: P,
  controller?: Controller,
  /** default is on* and domRef and controllerRef, but you can add more */
  needAccessifyProps?: string[],
): DeAccessifyProps<P> {
  const accessifiedProps = Object.defineProperties(
    {},
    Reflect.ownKeys(props).reduce((acc: any, key) => {
      acc[key] = {
        enumerable: true,
        get() {
          const v = props[key]
          const isPreferUseOriginalValue =
            isString(key) &&
            (needAccessifyProps?.includes(key) || key.startsWith('on') || key === 'domRef' || key === 'controllerRef')
          const needAccessify = isFunction(v) && !isPreferUseOriginalValue
          return needAccessify ? v(controller) : v
        },
      }
      return acc
    }, {} as PropertyDescriptorMap),
  ) as DeAccessifyProps<P>
  return accessifiedProps
}

function fixFunctionParams<F extends AnyFn, P extends any[] = Parameters<F>>(originalFn: F, preParams: P): F {
  // @ts-expect-error no need to check
  return {
    [originalFn.name]: (...args: unknown[]) => originalFn(...shallowMergeTwoArray(preParams, args)),
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
