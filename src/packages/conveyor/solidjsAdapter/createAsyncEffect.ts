import { createEffect } from 'solid-js'

/** run in microstask, so can avoid warning: computations created outside a `createRoot` or `render` will never be disposed */
// @ts-ignore force
export const asynclyCreateEffect: typeof createEffect = (callback, options) => {
  Promise.resolve().then(() => {
    createEffect(callback, options)
  })
}
