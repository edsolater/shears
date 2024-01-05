import { AnyFn, AnyObj, isFunction, isObject, isString } from '@edsolater/fnkit'
import { ValidController } from '../piv/typeTools'

export type Accessify<V, Controller extends ValidController | unknown = unknown> = V | ((controller: Controller) => V)
export type DeAccessify<V> = V extends Accessify<infer T, any> ? T : V

/**
 * propertyName start with 'on' or end with 'Fn' will treate as origin
 */
export type AccessifyProps<P extends AnyObj, Controller extends ValidController | unknown = unknown> = {
  [K in keyof P]: K extends
    | `on${string}` // callback onXXX should no auto-accessified
    | `render${string}` // renderXXX should no auto-accessified, if need pass subcomponent and have controller, just pass Captilazed prop name like Dot={}
    | `${string}:${string}` // any namespaced props should no auto-accessified
    | `domRef`
    | `controllerRef`
    | 'children'
    ? P[K]
    : P[K] extends AnyFn | undefined
      ? P[K]
      : Accessify<P[K], Controller>
}

export type DeAccessifyProps<P> = {
  [K in keyof P]: K extends
    | `on${string}` // callback onXXX should no auto-accessified
    | `render${string}` // renderXXX should no auto-accessified
    | `${string}:${string}` // any namespaced props should no auto-accessified
    | `domRef`
    | `controllerRef`
    | 'children'
    ? P[K]
    : Exclude<P[K], AnyFn> // <-- bug here, type error
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
  // why slower than just reduce? 🤔
  return changeObject(props, ({ value, key }) => {
    const isPreferOriginalValue =
      isString(key) &&
      ((needAccessifyProps ? !needAccessifyProps?.includes(key) : false) ||
        key.startsWith('on') ||
        key.startsWith('render:') ||
        key.startsWith('merge:') ||
        key === 'domRef' ||
        key === 'controllerRef' ||
        key === 'plugin' ||
        key === 'shadowProps')
    const needAccessify = isFunction(value) && !isPreferOriginalValue
    return needAccessify ? value(controller) : value
  }) as DeAccessifyProps<P>
  // const accessifiedProps = Object.defineProperties(
  //   {},
  //   Reflect.ownKeys(props).reduce((acc: any, key) => {
  //     acc[key] = {
  //       enumerable: true,
  //       get() {
  //         const v = props[key]
  //         /** will do nothing even it is a function */
  //         const isPreferOriginalValue =
  //           isString(key) &&
  //           ((needAccessifyProps ? !needAccessifyProps?.includes(key) : false) ||
  //             key.startsWith('on') ||
  //             key.startsWith('render:') ||
  //             key.startsWith('merge:') ||
  //             key === 'domRef' ||
  //             key === 'controllerRef' ||
  //             key === 'plugin' ||
  //             key === 'shadowProps')
  //         const needAccessify = isFunction(v) && !isPreferOriginalValue
  //         return needAccessify ? v(controller) : v
  //       },
  //     }
  //     return acc
  //   }, {} as PropertyDescriptorMap),
  // ) as DeAccessifyProps<P>
  // return accessifiedProps
}

/** like mergeObjects as faster as you can*/
function changeObject(obj: object, mutateFn: (payload: { value: any; key: keyof any }) => any): object {
  let keys: Set<string | symbol> | undefined = undefined
  let keysArray: (string | symbol)[] | undefined = undefined

  function getOwnKeys() {
    if (!keys || !keysArray) {
      keysArray = Reflect.ownKeys(obj)
      keys = new Set(keysArray)
    }
    return { a: keysArray, s: keys }
  }
  return new Proxy(obj, {
    apply(target, thisArg, argArray) {
      const fn = target
      return fn && Reflect.apply(fn as AnyFn, thisArg, argArray)
    },
    get: (target, key) => {
      const value = target[key]
      const v = mutateFn({ value, key })
      return v
    },
    set: (_target, key, value) => Reflect.set(_target, key, value),
    has: (_target, key) => getOwnKeys().s.has(key),
    getPrototypeOf: (target) => Object.getPrototypeOf(target),
    ownKeys: () => getOwnKeys().a,
    // for Object.keys to filter
    getOwnPropertyDescriptor: (target, p) => Reflect.getOwnPropertyDescriptor(target, p),
  })
}
function fixFunctionParams<F extends AnyFn, P extends any[] = Parameters<F>>(originalFn: F, preParams: P): F {
  // @ts-expect-error no need to check
  return {
    [originalFn.name]: (...args: unknown[]) => originalFn(...shallowMergeTwoArray(preParams, args)),
  }[originalFn.name]
}

export function deAccessify<V>(v: Accessify<V, any>, controller?: object): V {
  return isFunction(v) ? v(controller) : v
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
