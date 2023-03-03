import { AnyFn, isFunction, isString, uncapitalize } from '@edsolater/fnkit'
import { createStore } from 'solid-js/store'
import { OnChangeCallback, OnFirstAccessCallback, Store } from './type'

function toCallbackMap<F extends AnyFn>(pairs: { propertyName: string | number | symbol; cb: F }[] = []) {
  const map = new Map<string, F[] | undefined>()
  pairs.forEach(({ propertyName, cb }) => {
    if (!isString(propertyName)) throw new Error('propertyName must be string')
    const callbacks = map.get(propertyName) ?? []
    callbacks.push(cb)
    map.set(propertyName, callbacks)
  })
  return map
}

/** CORE */
export function createProxiedStore<T extends Record<string, any>>(
  defaultValue?: T,
  options?: {
    onFirstAccess?: { propertyName: keyof T; cb: OnFirstAccessCallback<T> }[]
    onChange?: { propertyName: keyof T; cb: OnChangeCallback<T> }[]
  }
): Store<T> {
  const onFirstAccessCallbackMap = new Map(toCallbackMap(options?.onFirstAccess))
  const onChangeCallbackMap = new Map(toCallbackMap(options?.onChange))

  function invokeOnInitGets(propertyName: string, value: any, store: Store<T>) {
    onFirstAccessCallbackMap.get(propertyName)?.forEach((cb) => {
      cb(store)
    })
    onFirstAccessCallbackMap.delete(propertyName) // it's init, so sould delete eventually
  }
  function invokeOnChanges(propertyName: string, newValue: any, prevValue: any, store: Store<T>) {
    onChangeCallbackMap.get(propertyName)?.forEach((cb) => {
      cb(newValue,prevValue, store)
    })
  }

  const [rawStore, setRawStore] = createStore(defaultValue)
  const proxiedStore = new Proxy(rawStore, {
    // result contain keys info
    get: (target, p, receiver) => {
      if (p === 'setStore') return setRawStore

      const targetType = isString(p) && p.startsWith('set') ? 'setter' : 'getter'

      if (targetType === 'setter') {
        const propertyName = uncapitalize((p as string).slice('set'.length))
        return (dispatch: ((newValue: unknown, prevValue?: unknown) => unknown) | unknown) => {
          const prevValue = Reflect.get(target, propertyName, receiver)
          const newValue = isFunction(dispatch) ? dispatch(prevValue) : dispatch
          if (prevValue === newValue) return // no need to update store with the same value
          invokeOnChanges(propertyName, newValue, prevValue, proxiedStore)
          setRawStore({ [propertyName]: newValue })
          return newValue
        }
      }

      if (targetType === 'getter') {
        return () => {
          const propertyName = p as string
          const newValue = Reflect.get(target, propertyName, receiver)
          invokeOnInitGets(propertyName, newValue, proxiedStore)
          return newValue
        }
      }
    }
  }) as Store<T>

  return proxiedStore
}
