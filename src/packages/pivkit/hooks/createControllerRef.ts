import { createSignal } from 'solid-js'

export function createControllerRef<T extends Record<string, any> = Record<string, any>>(): [
  ref: () => T | undefined,
  setRef: (el: unknown) => void,
] {
  const [ref, setRef] = createSignal<T | undefined>(undefined)
  return [ref, setRef]
}
