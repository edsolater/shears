import { AnyFn, isObject, mergeObjects } from '@edsolater/fnkit'

export type SettingsFunction<F extends AnyFn = AnyFn> = F & {
  /** inject params */
  addParam(): F
  addParam(...args: [Partial<Parameters<F>[0]>]): F
  addParam(...args: [Partial<Parameters<F>[0]>, Partial<Parameters<F>[1]>]): F
  addParam(...args: [Partial<Parameters<F>[0]>, Partial<Parameters<F>[1]>, Partial<Parameters<F>[2]>]): F
  addParam(...args: [Partial<Parameters<F>[0]>, Partial<Parameters<F>[1]>, Partial<Parameters<F>[2]>, ...any[]]): F
  addParam(...args: any[]): F
}

/**
 * creator
 * can add parameter without invoke
 */
export function settingsFunction<F extends AnyFn>(
  coreFn: F,
  settings?: { defaultParams?: any[]; label?: symbol }
): SettingsFunction<F> {
  /**
   * to without effect old params
   */
  function mergeParams(oldParams: any[], newParams: any[]) {
    const params = Array.from({ length: Math.max(oldParams.length, newParams.length) })
    for (let i = 0; i < params.length; i++) {
      params[i] =
        isObject(oldParams[i]) && isObject(newParams[i]) ? mergeObjects(oldParams[i], newParams[i]) : newParams[i]
    }
    return params
  }

  /**
   *
   * @param cachedParameters cached params
   * @returns proxied settings function
   */
  function createProxyWithCache(cachedParameters: any[]) {
    const settingsFunction = new Proxy(coreFn, {
      apply: (target, thisArg, argArray) => Reflect.apply(target, thisArg, mergeParams(cachedParameters, argArray)),
      get: (target, p, receiver) =>
        p === 'addParam'
          ? (...additionalParams: any[]) => createProxyWithCache(mergeParams(cachedParameters, additionalParams))
          : Reflect.get(target, p, receiver),
    }) as SettingsFunction<F>

    if (settings?.label) Reflect.set(settingsFunction, settings.label, true)

    return settingsFunction
  }

  return createProxyWithCache(settings?.defaultParams?.slice() ?? [])
}

export function isSettingsFunction(v: any): v is SettingsFunction {
  return Reflect.has(v, 'addParam')
}
