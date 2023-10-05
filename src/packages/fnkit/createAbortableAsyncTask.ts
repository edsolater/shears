import { Subscribable, createSubscribable } from '@edsolater/fnkit'
import { invoke } from './invoke'

/**
 * make it  possiable to abort inside the progress of task
 * inner use basic subscribable
 */
export function createAbortableAsyncTask<T>(
  task: (utils: { resolve: (value: T | PromiseLike<T>) => void; aborted: () => boolean }) => void,
): {
  abort(): void
  resultSubscribable: Subscribable<T>
  injectToSubscribable(value: T): void
} {
  let isTaskAborted = false
  const innerResolve: (value: T | PromiseLike<T>) => void = async (asyncValue) => {
    const value = await asyncValue
    if (isTaskAborted) return // case: abort before value promise fulfilled
    inject(value)
  }
  const [taskResultSubscribable, inject] = createSubscribable<T>()
  const utils = { resolve: innerResolve, aborted: () => isTaskAborted }
  invoke(task, utils)
  return {
    abort: () => {
      isTaskAborted = true
    },
    resultSubscribable: taskResultSubscribable,
    injectToSubscribable: inject,
  }
}
