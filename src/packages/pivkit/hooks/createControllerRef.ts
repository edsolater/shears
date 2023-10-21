import { createSignal } from 'solid-js'

/**
 * TODO: controller should be a (T) not (() => T)
 * @returns a object with proxy
 */
export function createControllerRef<T extends Record<string, any> = Record<string, any>>(): [
  ref: () => T | undefined,
  setRef: (el: unknown) => void,
] {
  const [ref, setRef] = createSignal<T | undefined>(undefined)
  return [ref, setRef]
}
