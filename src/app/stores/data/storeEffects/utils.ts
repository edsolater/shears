/**
 * use this to track accessed store properties
 */

import { createAbortableAsyncTask } from '@edsolater/fnkit'
import { createEffect, createMemo } from 'solid-js'
import { store, StoreData } from '../store'

// @ts-expect-error 🍺
function createGetAciveProperties<T extends object>(store: T): (keyof T)[] {}

// const { abort, resultSubscribable } = createAbortableAsyncTask(async () => {
//   createEffect(() => {
//     const _track1 = store.pairInfos
//   })
// })

/**
 * only run effect when store properties in needToAccess are accessed
 * @param runWhen
 * @param effect
 */
function createStoreEffect<Store extends object>(
  runWhen: () =>
    | boolean
    | undefined /* TODO this can define manually , but how to get current page using variables?🤔 */,
  effect: () => void,
) {
  const shouldInvoke = createMemo(runWhen)
  createEffect(() => {
    if (shouldInvoke()) {
      effect()
    }
  })
}
