import { onCleanup, createEffect } from 'solid-js'

/**
 * **DOM API (setTimeout)**
 *
 * use seconds , not milliseconds \
 * will auto clear when component unmount
 */
export function useTimeout(callback: () => void, delay = 1) {
  createEffect(() => {
    const timeoutId = setTimeout(callback, delay * 1000)
    onCleanup(() => clearTimeout(timeoutId))
  })
}
