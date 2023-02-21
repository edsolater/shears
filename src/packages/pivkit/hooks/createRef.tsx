import { createSignal } from 'solid-js'

/** for semantic API is like `createSignal()`  */
export function createRef<T extends HTMLElement = HTMLElement>(): [ref: () => T | undefined, setRef: (el) => void] {
  const [ref, setRef] = createSignal<T | undefined>(undefined)
  return [ref, setRef]
}
