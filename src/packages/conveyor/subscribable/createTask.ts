/**
 * *********
 * observe user action towards the object|function
 * *********
 */
import { WeakerSet } from '@edsolater/fnkit'
import { TrackableSubscribable } from './trackableSubscribable'

export type TaskExecutor = {
  (): void
  relatedSubscribables: WeakerSet<TrackableSubscribable<any>>
  readonly visiable: boolean
}

/**
 * like solidjs's createEffect, will track all subscribable's getValue option in it
 */
export function createTask(task: (get: <T>(v: TrackableSubscribable<T>) => T) => void) {
  const execute = (() => {
    function get<T>(subscribable: TrackableSubscribable<T>) {
      recordSubscribableToContext(subscribable, execute)
      return getSubscribableWithContext(execute, subscribable)
    }
    task(get)
  }) as TaskExecutor
  execute.relatedSubscribables = new WeakerSet<TrackableSubscribable<any>>()
  Object.defineProperty(execute, 'visiable', {
    get() {
      return isExecutorVisiable(execute)
    },
  })
  execute()
}

/**
 * high function that create value getter from subscribable
 */
function getSubscribableWithContext<T>(context: TaskExecutor, subscribable: TrackableSubscribable<T>) {
  subscribable.subscribedExcuters.add(context)
  return subscribable()
}

function recordSubscribableToContext<T>(subscribable: TrackableSubscribable<T>, context: TaskExecutor) {
  context.relatedSubscribables.add(subscribable)
}

function isExecutorVisiable(context: TaskExecutor) {
  return [...context.relatedSubscribables].some((subscribable) => subscribable.isVisiable)
}
