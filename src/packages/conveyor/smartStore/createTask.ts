/**
 * *********
 * observe user action towards the object|function
 * *********
 */
import { WeakerSet } from '@edsolater/fnkit'
import { assignObject } from '../../fnkit/assignObject'
import { asyncInvoke } from '../../pivkit/hooks/createContextStore/utils/asyncInvoke'
import { Shuck, recordSubscribableToAtom } from './createShuck'

export type TaskExecutor = {
  (): void
  relatedLeafs: WeakerSet<Shuck<any>>
  readonly visiable: boolean
}
export type TaskRunner = {
  // main method of task, force to run the effect
  run(): void
  // main method of task, only register the effect (if haven't detect relatedLeafs or any of leaves is visiable, it will run immediately)
  register(): void
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
 * })
 */
export function createTask(
  ...params:
    | [taskContentFn: (get: <T>(v: Shuck<T>) => T) => void]
    | [relatedLeafs: Shuck<any>[], taskContentFn: (get: <T>(v: Shuck<T>) => T) => void]
) {
  const [relatedLeafs, task] = params.length === 1 ? [undefined, params[0]] : params
  const executor = (() => {
    function pickSubscribableValue<T>(atom: Shuck<T>) {
      recordSubscribableToExecutor(atom, executor)
      recordSubscribableToAtom(executor, atom)
      return atom()
    }
    task(pickSubscribableValue)
  }) as TaskExecutor
  assignObject(executor, {
    relatedLeafs: new WeakerSet<Shuck<any>>(relatedLeafs),
    get visiable() {
      return isExecutorVisiable(executor)
    },
  })
  const taskRunner: TaskRunner = {
    run() {
      executor()
    },
    executor,
    register() {
      if (relatedLeafs) {
        relatedLeafs.forEach((leaf) => {
          recordSubscribableToExecutor(leaf, executor)
          recordSubscribableToAtom(executor, leaf)
        })
        if (isExecutorVisiable(executor)) executor()
      } else {
        executor()
      }
    },
  }
  return taskRunner
}

function recordSubscribableToExecutor<T>(subscribable: Shuck<T>, context: TaskExecutor) {
  context.relatedLeafs.add(subscribable)
}

function isExecutorVisiable(context: TaskExecutor) {
  for (const leaf of context.relatedLeafs) {
    if (leaf.visiable()) return true
  }
  return false
}

/** **only place** to invoke task executor */
export function invokeExecutor(executor: TaskExecutor) {
  if (executor.visiable) {
    asyncInvoke(executor)
  }
}
