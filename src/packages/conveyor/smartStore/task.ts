/**
 * *********
 * observe user action towards the object|function
 * *********
 */
import { WeakerSet } from '@edsolater/fnkit'
import { assignObject } from '../../fnkit/assignObject'
import { asyncInvoke } from '../../pivkit/hooks/createContextStore/utils/asyncInvoke'
import { Shuck, isShuckVisiable, recordSubscribableToAtom } from './shuck'

export type TaskExecutor = {
  (): void
  relatedShucks: WeakerSet<Shuck<any>>
  readonly visiable: boolean // TODO: need to be a subscribable
}
export type TaskRunner = {
  // main method of task, force to run the effect
  run(): void
  // main method of task, only register the effect (if haven't detect relatedShucks or any of leaves is visiable, it will run immediately)
  register(): void
  executor: TaskExecutor
}

/**
 * like solidjs's createEffect, will track all subscribable's getValue option in it
 *
 * when relatedShucks is hinted, task function will only run when relatedShucks is visiable
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
    | [relatedShucks: Shuck<any>[], taskContentFn: (get: <T>(v: Shuck<T>) => T) => void]
) {
  const [relatedShucks, task] = params.length === 1 ? [undefined, params[0]] : params
  const executor = (() => {
    function pickSubscribableValue<T>(atom: Shuck<T>) {
      recordSubscribableToExecutor(atom, executor)
      recordSubscribableToAtom(executor, atom)
      return atom()
    }
    task(pickSubscribableValue)
  }) as TaskExecutor
  assignObject(executor, {
    relatedShucks: new WeakerSet<Shuck<any>>(relatedShucks),
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
      if (relatedShucks) {
        relatedShucks.forEach((shuck) => {
          recordSubscribableToExecutor(shuck, executor)
          recordSubscribableToAtom(executor, shuck)
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
  context.relatedShucks.add(subscribable)
}

function isExecutorVisiable(context: TaskExecutor) {
  for (const shuck of context.relatedShucks) {
    if (isShuckVisiable(shuck)) return true
  }
  return false
}

/** **only place** to invoke task executor */
export function invokeExecutor(executor: TaskExecutor) {
  if (executor.visiable) {
    asyncInvoke(executor)
  }
}
