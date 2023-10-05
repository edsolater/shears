import { Signal, createEffect, createSignal } from 'solid-js'

/**
 * signal's action will only load when first access the acessor
 * if it's promise, default is undefined
 * lazyValue is in track scope
 */
// TODO: haven't test yet
export function createLazySignal<V>(lazyLoadInitValue: () => V | Promise<V>, defaultValue?: V): Signal<V> {
  const [hasAccessed, setHasAccessed] = createSignal(false)
  let innerOnFirstAccessFunction = lazyLoadInitValue
  const [signal, _setSignal] = createSignal<V | undefined>(defaultValue) // no need to type check
  const getSignal = () => {
    if (!hasAccessed()) {
      setHasAccessed(true)
      // Don't know how to avoid init get value twice
      // const value = innerOnFirstAccessFunction()
      // _setSignal(() => value)
    }
    return signal()
  }
  createEffect(async () => {
    if (!hasAccessed()) return
    const value = await innerOnFirstAccessFunction()
    _setSignal(() => value)
  })
  const setSignal = (...args: Parameters<typeof _setSignal>) => {
    if (hasAccessed()) {
      return _setSignal(...args)
    } else {
      innerOnFirstAccessFunction = () => {
        innerOnFirstAccessFunction()
        _setSignal(...args)
        return signal() as V
      }
    }
  }
  // @ts-expect-error force
  return [getSignal, setSignal]
}
