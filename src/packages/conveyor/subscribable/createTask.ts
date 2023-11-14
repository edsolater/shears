/**
 * *********
 * observe user action towards the object|function
 * *********
 */
import { WeakerSet } from '@edsolater/fnkit'
import { TrackableSubscribable, getSubscribableWithContext } from './trackableSubscribable'

export type TaskExecutor = {
  (): void
  relatedSubscribables: WeakerSet<TrackableSubscribable<any>>
  readonly visiable: boolean
}

/**
 * like solidjs's createEffect, will track all subscribable's getValue option in it
 *
 * when relatedSubscribables is hinted, task function will only run when relatedSubscribables is visiable
 * otherwise, initly task function must it to track the subscribables
 */
export function createTask(
  ...params:
    | [task: (get: <T>(v: TrackableSubscribable<T>) => T) => void]
    | [relatedSubscribables: TrackableSubscribable<any>[], task: (get: <T>(v: TrackableSubscribable<T>) => T) => void]
) {
  const [relatedSubscribables, task] = params.length === 1 ? [undefined, params[0]] : params
  const execute = (() => {
    function get<T>(subscribable: TrackableSubscribable<T>) {
      recordSubscribableToContext(subscribable, execute)
      return getSubscribableWithContext(execute, subscribable)
    }
    task(get)
  }) as TaskExecutor
  execute.relatedSubscribables = new WeakerSet<TrackableSubscribable<any>>(relatedSubscribables)
  Object.defineProperty(execute, 'visiable', {
    get() {
      return isExecutorVisiable(execute)
    },
  })
  execute() // init invoke to track the subscribables
}

function recordSubscribableToContext<T>(subscribable: TrackableSubscribable<T>, context: TaskExecutor) {
  context.relatedSubscribables.add(subscribable)
}

function isExecutorVisiable(context: TaskExecutor) {
  return [...context.relatedSubscribables].some((subscribable) => subscribable.isVisiable)
}
