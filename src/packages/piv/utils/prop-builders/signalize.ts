import { isFunction } from '@edsolater/fnkit'
import { SignalizeProps } from '../../types/tools'

// can only convert primary object literal or array type
export function signalize<T extends object | undefined>(props: T): SignalizeProps<NonNullable<T>> {
  return new Proxy(props ?? {}, {
    // result contain keys info
    get: (target, p, receiver) => {
      const onlyCheckType = Reflect.get(target, p, receiver)
      if (isFunction(onlyCheckType)) return Reflect.get(target, p, receiver)
      return () => Reflect.get(target, p, receiver) // must access directly, but don't know why🤯🤯🤯🤯
    }
  }) as any
}
