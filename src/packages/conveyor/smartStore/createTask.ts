/**
 * *********
 * observe user action towards the object|function
 * *********
 */
import { WeakerSet } from '@edsolater/fnkit'
import { assignObject } from '../../fnkit/assignObject'
import { asyncInvoke } from '../../pivkit/hooks/createContextStore/utils/asyncInvoke'
import { Leaf, getSubscribableWithContext } from './createLeaf'

export type TaskExecutor = {
  (): void
  relatedLeafs: WeakerSet<Leaf<any>>
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
 * when relatedLeafs is hinted, task function will only run when relatedLeafs is visiable
 * otherwise, initly task function must it to track the subscribables
 *
 * @example
 * const testObserverableSubscribable = createLeaf(1)
 * const testObserverableSubscribableB = createLeaf(1, { visiable: true })
 *
 * const task = createTask([testObserverableSubscribable, testObserverableSubscribableB], async (get) => {
 *   await Promise.resolve(3)
 *   console.log('🧪 task begin: ', get(testObserverableSubscribable), get(testObserverableSubscribableB)) //🤔 why run 1 twice?
 * })
 */
export function createTask(
  ...params:
    | [taskContentFn: (get: <T>(v: Leaf<T>) => T) => void]
    | [relatedLeafs: Leaf<any>[], taskContentFn: (get: <T>(v: Leaf<T>) => T) => void]
) {
  const [relatedLeafs, taskContentFn] = params.length === 1 ? [undefined, params[0]] : params
  const executor = (() => {
    function get<T>(atom: Leaf<T>) {
      recordSubscribableToContext(atom, executor)
      return getSubscribableWithContext(executor, atom)
    }
    taskContentFn(get)
  }) as TaskExecutor
  assignObject(executor, {
    relatedLeafs: new WeakerSet<Leaf<any>>(relatedLeafs),
    get visiable() {
      return isExecutorVisiable(executor)
    },
  })
  const taskRunner: TaskRunner = {
    run() {
      executor()
    },
    executor,
  }
  return taskRunner
}

function recordSubscribableToContext<T>(subscribable: Leaf<T>, context: TaskExecutor) {
  context.relatedLeafs.add(subscribable)
}

function isExecutorVisiable(context: TaskExecutor) {
  return [...context.relatedLeafs].some((subscribable) => subscribable.visiable())
}

/** **only place** to invoke task executor */
export function invokeExecutor(executor: TaskExecutor) {
  if (executor.visiable) {
    asyncInvoke(executor)
  }
}
