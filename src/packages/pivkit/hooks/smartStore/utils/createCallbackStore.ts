import { AnyFn, MayArray, flap, isMap, isObject, isUndefined, mergeObjects } from '@edsolater/fnkit'

type Tail<T extends any[]> = T extends [any, ...infer E] ? E : never
type WithOnCleanUpFn<Callback extends AnyFn> = Parameters<Callback>[0] extends object
  ? (
      ...params: [{ onCleanUp(): void } & Parameters<Callback>[0], ...Tail<Parameters<Callback>>]
    ) => ReturnType<Callback>
  : Parameters<Callback>[0] extends undefined
  ? (...params: [{ onCleanUp(): void }, ...Tail<Parameters<Callback>>]) => ReturnType<Callback>
  : Callback

interface CallbackStore<Callback extends AnyFn> {
  invoke(...params: Parameters<Callback>): void
  addListener(cb: WithOnCleanUpFn<Callback>): {
    remove(): void
  }
  releaseStored(): void
  /** or you can just use property:{@link addListener}'s returned remove method, same */
  removeListener(cb: Callback): void
}

/**
 * util for handle Callbacks faster\
 *  will attach onCleanUp in first param of callback, if it is object or undefined
 * */
export function createCallbacksStore<Callback extends AnyFn>(options?: {
  initCallbacks?: MayArray<Callback>
}): CallbackStore<Callback> {
  const registeredCallbacks = options?.initCallbacks
    ? new Set<Callback>(flap(options.initCallbacks))
    : new Set<Callback>()
  const registeredCleanFn = new WeakMap<Callback, () => void>()
  function invoke(...params: Parameters<Callback>) {
    registeredCallbacks.forEach((cb) => {
      const prevCleanFn = registeredCleanFn.get(cb)
      prevCleanFn?.()
      function onCleanUp(cleanFn: () => void) {
        registeredCleanFn.set(cb, cleanFn)
      }
      // attach onCleanUp in first param of callback, if it is object or undefined
      const args = isObject(params[0])
        ? [mergeObjects({ onCleanUp }, params[0]), ...params.slice(1)]
        : isUndefined(params[0])
        ? [{ onCleanUp }, ...params.slice(1)]
        : params

      cb(...args)
    })
  }
  function addListener(cb: Callback) {
    registeredCallbacks.add(cb)
    return {
      remove() {
        removeListener(cb)
      },
    }
  }
  function releaseStored() {
    registeredCallbacks.clear()
  }
  /** or you can just use {@link addListener}'s returned remove method, same */
  function removeListener(cb: Callback) {
    registeredCallbacks.delete(cb)
  }
  return { invoke, addListener, releaseStored, removeListener }
}

/**
 * like {@link createCallbacksStore}, but have key(currently must be string)
 */
export function createCallbacksStoreWithKeys<Key extends string, Callback extends AnyFn>(options?: {
  initCallbacks?: Record<Key, MayArray<Callback>>
}) {
  const registeredCallbacks = (
    options?.initCallbacks
      ? new Map(
          Object.entries(options.initCallbacks).map(([k, mcb]) => [
            k as Key,
            createCallbacksStore({ initCallbacks: mcb as MayArray<Callback> }),
          ]),
        )
      : new Map()
  ) as Map<Key, CallbackStore<Callback>>

  function invoke(propertyName: Key) {
    return (...params: Parameters<Callback>) => {
      const callbackStore = registeredCallbacks.get(propertyName)
      callbackStore?.invoke(...params)
    }
  }

  function addListener(propertyName: Key) {
    return (cb: Callback) => {
      if (!registeredCallbacks.has(propertyName)) {
        registeredCallbacks.set(propertyName, createCallbacksStore<Callback>())
      }
      const cbs = registeredCallbacks.get(propertyName)!
      const remove = cbs.addListener(cb)
      return { remove }
    }
  }

  function releaseStored() {
    registeredCallbacks.clear()
  }

  /** or you can just use {@link addListener}'s returned remove method, same */
  function removeListener(propertyName: Key) {
    return (cb: Callback) => {
      registeredCallbacks.get(propertyName)?.removeListener(cb)
    }
  }

  return { invoke, addListener, releaseStored, removeListener }
}
