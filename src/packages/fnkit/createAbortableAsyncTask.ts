import { Subscribable } from './customizedClasses/Subscribable'
import { invoke } from './invoke'

/**
 * make it  possiable to abort inside the progress of task
 * inner use basic subscribable
 */
export function createAbortableAsyncTask<T>(
  task: (utils: { resolve: (value: T | PromiseLike<T>) => void; aborted: () => boolean }) => void
): {
  abort(): void
  resultSubscribable: Subscribable<T>
} {
  let isTaskAborted = false
  const innerResolve: (value: T | PromiseLike<T>) => void = async (asyncValue) => {
    const value = await asyncValue
    if (isTaskAborted) return // case: abort before value promise fulfilled
    taskResultSubscribable.inject(value)
  }
  const taskResultSubscribable = new Subscribable<T>()
  const utils = { resolve: innerResolve, aborted: () => isTaskAborted }
  invoke(task, utils)
  return {
    abort: () => {
      isTaskAborted = true
    },
    resultSubscribable: taskResultSubscribable,
  }
}
