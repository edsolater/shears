import { Accessor, createSignal } from 'solid-js'
import { ValidController } from '../../piv/types/tools'

/** for semantic API is like `createSignal()`  */
export function createRef<T extends HTMLOrSVGElement | ValidController = any>(): [
  ref: Accessor<T | undefined>,
  setRef: (el: unknown) => void,
] {
  const [ref, setRef] = createSignal<T | undefined>(undefined)
  return [ref, setRef]
}
