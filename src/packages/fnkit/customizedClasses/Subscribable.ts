import { AnyFn, isFunction } from '@edsolater/fnkit'

export type SubscribeFn<T> = ((value: T) => void | Promise<void>) | ((newValue: T) => void)

export type Subscribable<T> = {
  current: T
  subscribe: (cb: SubscribeFn<T>) => { unsubscribe(): void }
}

type SubscribableDispatcher<T> = T | ((oldValue: T) => T)

/**
 * Subscribable is a object that has subscribe method.
 * it can be the data atom of App's store graph
 */
export function createSubscribable<T>(
  defaultValue?: T,
  defaultCallbacks?: SubscribeFn<T>[],
): [subscribable: Subscribable<T>, setValue: (dispatcher: SubscribableDispatcher<T | undefined>) => void] {
  const callbacks = new Set<SubscribeFn<T>>(defaultCallbacks)
  const cleanFnMap = new Map<SubscribeFn<T>, AnyFn>()

  let innerValue = defaultValue as T

  callbacks.forEach(invokeCallback)

  function changeValue(dispatcher: SubscribableDispatcher<T | undefined>) {
    const newValue = isFunction(dispatcher) ? dispatcher(innerValue) : dispatcher
    if (newValue != null) {
      innerValue = newValue
    }
    callbacks.forEach(invokeCallback)
  }

  function invokeCallback(cb: SubscribeFn<T>) {
    const oldCleanFn = cleanFnMap.get(cb)
    if (isFunction(oldCleanFn)) oldCleanFn(innerValue)
    const cleanFn = cb(innerValue)
    if (isFunction(cleanFn)) cleanFnMap.set(cb, cleanFn)
  }

  const subscribable = {
    get current() {
      return innerValue
    },
    subscribe(cb: any) {
      if (innerValue != null) invokeCallback(cb) // immediately invoke callback, if has value
      callbacks.add(cb)
      return {
        unsubscribe() {
          callbacks.delete(cb)
        },
      }
    },
  }

  return [subscribable, changeValue]
}

export function createSubscribableFromPromise<T>(
  promise: Promise<T>,
  /* used when promise is pending */
  defaultValue?: T,
  defaultCallbacks?: SubscribeFn<T>[],
): [subscribable: Subscribable<T>, setValue: (dispatcher: SubscribableDispatcher<T | undefined>) => void] {
  const [subscribable, setValue] = createSubscribable(defaultValue, defaultCallbacks)
  promise.then(setValue)
  return [subscribable, setValue]
}
