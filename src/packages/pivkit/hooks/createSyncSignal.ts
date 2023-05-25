import { Signal, createEffect, createSignal, on } from 'solid-js'

/**
 * a shortcut
 */
export function createSyncSignal<T>(options: { get: (prev?: T) => T; set?: (value: T) => void }): Signal<T> {
  const [signal, setSignal] = createSignal(options.get())
  // invoke `get`
  createEffect(() => {
    console.log('12: ', 12)
    return setSignal((prev) => options.get(prev));
  })
  // invoke `set`
  createEffect(on(signal, (newValue) => options.set?.(newValue), { defer: true }))

  return [signal, setSignal]
}
