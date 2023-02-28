import { isArray, isFunction, isObject, map } from '@edsolater/fnkit'
import { SignalizeProps } from '../../types/tools'

// can only convert primary object literal or array type
export function signalize<T extends object | undefined>(props: T): SignalizeProps<NonNullable<T>> {
  const signalized = new Proxy(props ?? {}, {
    // result contain keys info
    get: (target, p, receiver) => {
      const onlyCheckType = Reflect.get(target, p, receiver)
      if (isObject(onlyCheckType)) {
        if (isFunction(onlyCheckType)) return onlyCheckType
        if (isArray(onlyCheckType)) return map(onlyCheckType, signalize)
        if (isObjectLiteral(onlyCheckType)) return Object.assign(onlyCheckType, map(onlyCheckType, signalize))
        return onlyCheckType // other objects
      }
      return () => Reflect.get(target, p, receiver) // must access directly, but don't know why🤯🤯🤯🤯
    }
  }) as any
  return signalized
}

function isObjectLiteral(v: unknown): v is object {
  return isObject(v) && 'constructor' in v && v['constructor'] === Object
}
