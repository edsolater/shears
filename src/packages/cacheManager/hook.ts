import { createEffect, createSignal, on, onMount } from "solid-js"
import { createLocalStorageStoreManager } from "./storageManagers"

/**
 * @todo currently only localStorage is supported
 */
export function useStorageValue(options: { key: string; defaultValue?: string }) {
  const manager = createLocalStorageStoreManager<any>()
  const [value, setValue] = createSignal<string | undefined>(options.defaultValue)
  onMount(() => {
    manager.get(options.key).then((value) => {
      setValue(value)
    })
  })
  createEffect(
    on(value, async () => {
      const storedValue = await manager.get(options.key)
      if (storedValue !== value()) {
        manager.set(options.key, value())
      }
    }),
  )
  return [value, setValue] as const
}
