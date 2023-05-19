import { AnyFn, AnyObj, isFunction, isObject, isString, shrinkFn } from '@edsolater/fnkit'
import { ValidController } from '../../piv/types/tools'

/**
 * propertyName start with 'on' or end with 'Fn' will treate as origin
 */
export type Accessify<P extends AnyObj, Controller extends ValidController = {}> = {
  [K in keyof P]: K extends `on${string}` | `ref` | `controllerRef` ? P[K] : P[K] | ((controller: Controller) => P[K])
}

export type DeAccessify<P> = P extends Accessify<infer A, any> ? A : P
/**
 * propertyName start with 'on' will treate as function
 */
export function useAccessifiedProps<P extends AnyObj, Controller extends ValidController = {}>(
  props: P,
  controller?: Controller,
  /** default is on_ and domRef and controllerRef, but you can add more */
  noNeedAccessifyProps?: string[]
): DeAccessify<P> {
  const accessifiedProps = Object.defineProperties(
    {},
    Reflect.ownKeys(props).reduce((acc: any, key) => {
      acc[key] = {
        enumerable: true,
        get() {
          const v = props[key]
          const noNeedAccessify =
            isString(key) &&
            (noNeedAccessifyProps?.includes(key) || key.startsWith('on') || key === 'domRef' || key === 'controllerRef')
          return noNeedAccessify ? v :( typeof v === 'function' ? v(controller) : v)
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
