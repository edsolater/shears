/**
 * *********
 * observe user action towards the object|function
 * *********
 */
import { WeakerSet } from '@edsolater/fnkit'
import { assignObject } from '../../fnkit/assignObject'
import { asyncInvoke } from '../../pivkit/hooks/createContextStore/utils/asyncInvoke'
import {
  TaskSubscribable,
  getSubscribableWithContext
} from './taskSubscribable'

export type TaskExecutor = {
  (): void
  relatedSubscribables: WeakerSet<TaskSubscribable<any>>
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
    | [task: (get: <T>(v: TaskSubscribable<T>) => T) => void]
    | [relatedSubscribables: TaskSubscribable<any>[], task: (get: <T>(v: TaskSubscribable<T>) => T) => void]
) {
  const [relatedSubscribables, task] = params.length === 1 ? [undefined, params[0]] : params
  const execute = (() => {
    function get<T>(subscribable: TaskSubscribable<T>) {
      recordSubscribableToContext(subscribable, execute)
      return getSubscribableWithContext(execute, subscribable)
    }
    task(get)
  }) as TaskExecutor
  assignObject(
    execute,
    { relatedSubscribables: new WeakerSet<TaskSubscribable<any>>(relatedSubscribables) },
    { visiable: () => isExecutorVisiable(execute) },
  )
  execute() // init invoke to track the subscribables
}

function recordSubscribableToContext<T>(subscribable: TaskSubscribable<T>, context: TaskExecutor) {
  context.relatedSubscribables.add(subscribable)
}

function isExecutorVisiable(context: TaskExecutor) {
  return [...context.relatedSubscribables].some((subscribable) => subscribable.visiable())
}

/** **only place** to invoke task executor */
export function invokeExecutor(executor: TaskExecutor) {
  if (executor.visiable) {
    asyncInvoke(executor)
  }
}
