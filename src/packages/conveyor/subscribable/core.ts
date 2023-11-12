import { MayPromise, AnyFn, shrinkFn, isFunction, isPromise } from '@edsolater/fnkit'

const subscribableTag = Symbol('subscribable')

export type SubscribeFn<T> = (value: T, prevValue: T | undefined) => void

export interface Subscribable<T> {
  // when set this, means this object is a subscribable
  [subscribableTag]: boolean

  (): T
  subscribe: (cb: SubscribeFn<NonNullable<T>>) => { unsubscribe(): void }
  /** can not export this property by type */
  set(dispatcher: SubscribableSetValueDispatcher<T>): void
}

type SubscribableSetValueDispatcher<T> = MayPromise<T> | ((oldValue: T) => MayPromise<T>)

/**
 * Subscribable is a object that has subscribe method.
 * it can be the data atom of App's store graph
 * @param defaultValue value or a function that returns value, which means it only be called when needed
 */
export function createSubscribable<T>(defaultValue: T | (() => T), defaultCallbacks?: SubscribeFn<T>[]): Subscribable<T>
export function createSubscribable<T>(
  defaultValue?: T | undefined | (() => T | undefined),
  defaultCallbacks?: SubscribeFn<T | undefined>[],
): Subscribable<T | undefined>
export function createSubscribable<T>(
  defaultValue?: T | (() => T),
  defaultCallbacks?: SubscribeFn<T>[],
): Subscribable<T | undefined> {
  const subscribeFns = new Set<SubscribeFn<T>>(defaultCallbacks)
  const cleanFnMap = new Map<SubscribeFn<T>, AnyFn>()

  let value = shrinkFn(defaultValue) as T

  subscribeFns.forEach((cb) => invokeSubscribedCallbacks(cb, value, undefined))

  function changeValue(dispatcher: SubscribableSetValueDispatcher<T | undefined>) {
    const newValue = isFunction(dispatcher) ? dispatcher(value) : dispatcher
    if (isPromise(newValue)) {
      newValue.then((value) => {
        subscribeFns.forEach((cb) => invokeSubscribedCallbacks(cb, value, value))
        if (value != null) {
          value = value
        }
      })
    } else {
      subscribeFns.forEach((cb) => invokeSubscribedCallbacks(cb, newValue, value))
      if (newValue != null) {
        value = newValue
      }
    }
  }

  function invokeSubscribedCallbacks(cb: SubscribeFn<T>, newValue: T | undefined, prevValue: T | undefined) {
    const oldCleanFn = cleanFnMap.get(cb)
    if (isFunction(oldCleanFn)) oldCleanFn(value)
    const cleanFn = cb(newValue as T /*  type force */, prevValue)
    if (isFunction(cleanFn)) cleanFnMap.set(cb, cleanFn)
  }

  const subscribable = Object.assign(() => value, {
    [subscribableTag]: true,
    subscribe(cb: any) {
      if (value != null) invokeSubscribedCallbacks(cb, value, undefined) // immediately invoke callback, if has value
      subscribeFns.add(cb)
      return {
        unsubscribe() {
          subscribeFns.delete(cb)
        },
      }
    },
    set: changeValue,
  })

  return subscribable
}

export function isSubscribable<T>(value: any): value is Subscribable<T> {
  return value && value[subscribableTag]
}
