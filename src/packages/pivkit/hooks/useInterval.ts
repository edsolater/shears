import { onCleanup, createEffect } from 'solid-js'

/**
 * **DOM API (setInterval)**
 *
 * use seconds , not milliseconds \
 * will auto clear when component unmount
 */
export function useInterval(callback: () => void, s = 1, delay?: number) {
  createEffect(() => {
    const intervalId = setInterval(callback, s * 1e3)
    onCleanup(() => clearInterval(intervalId))
  })
}
