import { Accessor, createSignal } from 'solid-js'

/** for semantic API is like `createSignal()`  */
export function createDomRef<T extends HTMLElement = HTMLElement>(): {
  dom: Accessor<T | undefined>
  setDom: (el: unknown) => void
} {
  const [dom, setDom] = createSignal<T | undefined>(undefined)
  return { dom, setDom }
}
