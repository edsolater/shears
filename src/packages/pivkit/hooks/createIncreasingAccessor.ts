import { createSignal, createEffect } from 'solid-js'

/**
 * usually for debug
 * n will increasing every second (in default, n start from 0)
 */
export function createIncresingAccessor(options?: { start?: number }) {
  const [increasing, setI] = createSignal(options?.start ?? 0)
  createEffect(() => {
    setInterval(() => {
      setI((s) => s + 1)
    }, 1000)
  })
  return increasing
}
