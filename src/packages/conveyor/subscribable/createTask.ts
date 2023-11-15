/**
 * *********
 * observe user action towards the object|function
 * *********
 */
import { WeakerSet } from '@edsolater/fnkit'
import { assignObject } from '../../fnkit/assignObject'
import { asyncInvoke } from '../../pivkit/hooks/createContextStore/utils/asyncInvoke'
import { TaskSubscribable, getSubscribableWithContext } from './taskSubscribable'

export type TaskExecutor = {
  (): void
  relatedSubscribables: WeakerSet<TaskSubscribable<any>>
  readonly visiable: boolean
}
export type TaskRunner = {
  // main method of task
  run(): void
  executor: TaskExecutor
}

/**
 * like solidjs's createEffect, will track all subscribable's getValue option in it
 *
 * when relatedSubscribables is hinted, task function will only run when relatedSubscribables is visiable
 * otherwise, initly task function must it to track the subscribables
 * 
 * @example
 * const testObserverableSubscribable = createTaskSubscribable(1)
 * const testObserverableSubscribableB = createTaskSubscribable(1, { visiable: true })
 * 
 * const task = createTask([testObserverableSubscribable, testObserverableSubscribableB], async (get) => {
 *   await Promise.resolve(3)
 *   console.log('🧪 task begin: ', get(testObserverableSubscribable), get(testObserverableSubscribableB)) //🤔 why run 1 twice?
 * })
 */
export function createTask(
  ...params:
    | [taskContentFn: (get: <T>(v: TaskSubscribable<T>) => T) => void]
    | [relatedSubscribables: TaskSubscribable<any>[], taskContentFn: (get: <T>(v: TaskSubscribable<T>) => T) => void]
) {
  const [relatedSubscribables, taskContentFn] = params.length === 1 ? [undefined, params[0]] : params
  const executor = (() => {
    function get<T>(subscribable: TaskSubscribable<T>) {
      recordSubscribableToContext(subscribable, executor)
      return getSubscribableWithContext(executor, subscribable)
    }
    taskContentFn(get)
  }) as TaskExecutor
  assignObject(
    executor,
    { relatedSubscribables: new WeakerSet<TaskSubscribable<any>>(relatedSubscribables) },
    { visiable: () => isExecutorVisiable(executor) },
  )
  const taskRunner: TaskRunner = {
    run() {
      executor()
    },
    executor,
  }
  return taskRunner
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
