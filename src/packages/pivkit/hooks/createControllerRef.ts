import { createSignal } from 'solid-js'

/**
 * TODO: controller should be a (T) not (() => T)
 * @returns a object with proxy
 */
export function createControllerRef<T extends Record<string, any> = Record<string, any>>(): [
  ref: T,
  setController: (el: unknown) => void,
] {
  const [ref, setRef] = createSignal<T | undefined>(undefined)
  const controller = new Proxy(
    {},
    {
      get(_target, prop) {
        const controller = ref()
        if (!controller) {
          throw new Error('controller not ready')
        }
        return Reflect.get(controller, prop)
      },
    },
  ) as T
  return [controller, setRef]
}
