import { Accessor, createEffect } from 'solid-js'

/**
 * only itself(ref)
 *
 * this hooks build on assumption: resize of a child will resize his parent. so just observe it's parent node.
 *
 * @param ref
 * @param callback
 */
export default function useResizeObserver<El extends HTMLElement>(
  ref: Accessor<El | undefined>,
  callback?: (utilities: { entry: ResizeObserverEntry; el: El }) => unknown,
): { destory: () => void } {
  const resizeObserver =
    'ResizeObserver' in globalThis
      ? new globalThis.ResizeObserver((entries) => {
          entries.forEach((entry) => callback?.({ entry, el: entry.target as any }))
        })
      : undefined

  createEffect(() => {
    const el = ref()
    if (!el) return
    resizeObserver?.observe(el)
  }, [ref])

  const destory = () => {
    resizeObserver?.disconnect()
  }
  return { destory }
}
