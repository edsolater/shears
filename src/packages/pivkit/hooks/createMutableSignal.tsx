import { Signal, createEffect, createSignal } from 'solid-js'

/**
 * a shortcut
 */
export function createMutableSignal<T>(options: { get: (prev?: T) => T; set?: (value: T) => void }): Signal<T> {
  const [signal, setSignal] = createSignal(options.get())
  createEffect(() => setSignal((prev) => options.get(prev)))
  return [signal, setSignal]
}
