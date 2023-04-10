import { isPromise } from '@edsolater/fnkit'
import { Signal, createSignal } from 'solid-js'

/** if it's promise, default is undefined */
// TODO: haven't test yet
export function createFirstAccessSignal<V>(onFirstAccess: () => V | Promise<V>): Signal<V> {
  const [hasAccessed, setHasAccessed] = createSignal(false)
  let innerOnFirstAccessFunction = onFirstAccess
  const [signal, _setSignal] = createSignal()
  const getSignal = () => {
    const value = innerOnFirstAccessFunction()
    if (isPromise(value)) {
      value.then((solved) => _setSignal(() => solved))
    } else {
      _setSignal(() => value)
    }
    setHasAccessed(true)
    return signal()
  }
  const setSignal = (...args: Parameters<typeof _setSignal>) => {
    if (hasAccessed()) {
      return _setSignal(...args)
    } else {
      innerOnFirstAccessFunction = () => {
        _setSignal(...args)
        return signal() as V
      }
    }
  }
  // @ts-expect-error force
  return [getSignal, setSignal]
}
