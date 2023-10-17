import { Signal, createEffect, createSignal, on } from 'solid-js'

/**
 * a shortcut
 */
export function createSyncSignal<T>(options: {
  defaultValue(): T
  getValueFromOutside: (prev?: T) => T | undefined
  onInvokeSetter?: (value: T) => void
}): Signal<T>
export function createSyncSignal<T>(options: {
  defaultValue?(): T
  getValueFromOutside: (prev?: T) => T
  onInvokeSetter?: (value: T) => void
}): Signal<T>
export function createSyncSignal<T>(options: {
  defaultValue?(): T
  getValueFromOutside: (prev?: T) => T | undefined
  onInvokeSetter?: (value: T) => void
}): Signal<T> {
  const [accessor, setAccessor] = createSignal(
    'defaultValue' in options
      ? options.defaultValue?.() ?? options.getValueFromOutside()
      : options.getValueFromOutside(),
  )

  // invoke `get`
  createEffect(() => {
    console.log('invoke get')
    return setAccessor((prev) => {
      const newValue = options.getValueFromOutside(prev)
      console.log('newValue: ', newValue)
      return newValue ?? prev
    })
  })

  createEffect(() => {
    console.log('accessor(): ', accessor())
  })

  // invoke `set`
  createEffect(
    on(
      accessor,
      (newValue, prevValue) => {
        // same as input so no need to invoke the setter fn
        if (newValue === options.getValueFromOutside()) return
        options.onInvokeSetter?.(newValue as T)
      },
      { defer: true },
    ),
  )

  // @ts-expect-error no need to check
  return [accessor, setAccessor]
}
