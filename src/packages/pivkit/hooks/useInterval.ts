import { onCleanup } from 'solid-js'

/**
 * **DOM API (setInterval)**
 *
 * use seconds , not milliseconds \
 * will auto clear when component unmount
 */
export function useInterval(callback: () => void, delay: number) {
  createEffect(() => {
    const intervalId = setInterval(callback, delay * 1e3)
    onCleanup(() => clearInterval(intervalId))
  })
}
