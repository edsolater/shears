import { Accessor, createSignal } from 'solid-js'

/** for semantic API is like `createSignal()`  */
export function createRef<T extends HTMLElement = HTMLElement>(): [
  ref: Accessor<T | undefined>,
  setRef: (el: unknown) => void
] {
  const [ref, setRef] = createSignal<T | undefined>(undefined)
  return [ref, setRef]
}
