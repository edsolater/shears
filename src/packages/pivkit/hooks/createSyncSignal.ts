import { Signal, createEffect, createSignal, on } from 'solid-js'

/**
 * a shortcut
 */
export function createSyncSignal<T>(options: { get: (prev?: T) => T; set?: (value: T) => void }): Signal<T> {
  const [signal, setSignal] = createSignal(options.get())
  // invoke `get`
  createEffect(() => setSignal((prev) => options.get(prev)))
  // invoke `set`
  createEffect(
    on(
      signal,
      (newValue, prevValue) => {
        // same as input so no need to invoke the setter fn
        if (newValue === options.get()) return
        options.set?.(newValue)
      },
      { defer: true },
    ),
  )

  return [signal, setSignal]
}
