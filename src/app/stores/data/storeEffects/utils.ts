/**
 * use this to track accessed store properties
 */
import { createEffect, createMemo } from 'solid-js'

/**
 * only run effect when store properties in needToAccess are accessed
 * @param runWhen
 * @param effect
 */
export function createStoreEffect<Store extends object>(
  runWhen: () => any /* TODO this can define manually , but how to get current page using variables?🤔 */,
  effect: () => void,
) {
  const shouldInvoke = createMemo(runWhen)
  createEffect(() => {
    if (shouldInvoke()) {
      effect()
    }
  })
}
