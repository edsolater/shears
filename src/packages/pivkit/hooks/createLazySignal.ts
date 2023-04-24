import { Signal, createEffect, createSignal } from 'solid-js'

/**
 *  if it's promise, default is undefined
 *  lazyValue is in track scope
 */
// TODO: haven't test yet
export function createLazySignal<V>(lazyValue: () => V, defaultValue?: V): Signal<V> {
  const [hasAccessed, setHasAccessed] = createSignal(false)
  let innerOnFirstAccessFunction = lazyValue
  const [signal, _setSignal] = createSignal<any>(defaultValue) // no need to type check
  const getSignal = () => {
    if (!hasAccessed()) {
      setHasAccessed(true)
    }
    return signal()
  }
  createEffect(() => {
    if (!hasAccessed()) return
    const value = innerOnFirstAccessFunction()
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
