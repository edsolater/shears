import { isFunction } from '@edsolater/fnkit'
import { createSignal } from 'solid-js'

export function createControllerRef<T extends Record<string, any> = Record<string, any>>(): [
  ref: () => T | undefined,
  setRef: (el: unknown) => void
] {
  const [_ref, _setRef] = createSignal<T | undefined>(undefined)
  // @ts-ignore
  const setRef = (v: any) => (isFunction(v) ? _setRef(() => v) : _setRef(v))
  // @ts-ignore
  const ref = () => _ref()?.()
  return [ref, setRef]
}
