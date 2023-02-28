import { isArray, isFunction, isObject, map } from '@edsolater/fnkit'
import { SignalizeProps } from '../../types/tools'

export function signalizeProps<T extends object | undefined>(props: T): SignalizeProps<NonNullable<T>> {
  const signalized = new Proxy(props ?? {}, {
    // result contain keys info
    get: (target, p, receiver) => {
      if (p in target) {
        const value = Reflect.get(target, p, receiver)
        if (isFunction(value)) return value
        if (
          isObject(value) &&
          'constructor' in value &&
          unwrapableObjectConstructors.includes(value['constructor'] as any /* no need type check here */)
        )
          return value
        if (isArray(value)) return map(value, signalizeProps)
        if (isObject(value)) return map(value, signalizeProps)
        return () => value
      }
      return () => {}
    }
  }) as any
  return signalized
}

const unwrapableObjectConstructors = [Date, Error, RegExp]
