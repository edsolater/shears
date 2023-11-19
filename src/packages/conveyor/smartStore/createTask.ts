/**
 * *********
 * observe user action towards the object|function
 * *********
 */
import { WeakerSet } from '@edsolater/fnkit'
import { assignObject } from '../../fnkit/assignObject'
import { asyncInvoke } from '../../pivkit/hooks/createContextStore/utils/asyncInvoke'
import { TaskAtom, getSubscribableWithContext } from './createTaskAtom'

export type TaskExecutor = {
  (): void
  relatedTaskAtoms: WeakerSet<TaskAtom<any>>
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
 * when relatedTaskAtoms is hinted, task function will only run when relatedTaskAtoms is visiable
 * otherwise, initly task function must it to track the subscribables
 * 
 * @example
 * const testObserverableSubscribable = createTaskAtom(1)
 * const testObserverableSubscribableB = createTaskAtom(1, { visiable: true })
 * 
 * const task = createTask([testObserverableSubscribable, testObserverableSubscribableB], async (get) => {
 *   await Promise.resolve(3)
 *   console.log('🧪 task begin: ', get(testObserverableSubscribable), get(testObserverableSubscribableB)) //🤔 why run 1 twice?
 * })
 */
export function createTask(
  ...params:
    | [taskContentFn: (get: <T>(v: TaskAtom<T>) => T) => void]
    | [relatedTaskAtoms: TaskAtom<any>[], taskContentFn: (get: <T>(v: TaskAtom<T>) => T) => void]
) {
  const [relatedTaskAtoms, taskContentFn] = params.length === 1 ? [undefined, params[0]] : params
  const executor = (() => {
    function get<T>(atom: TaskAtom<T>) {
      recordSubscribableToContext(atom, executor)
      return getSubscribableWithContext(executor, atom)
    }
    taskContentFn(get)
  }) as TaskExecutor
  assignObject(
    executor,
    { relatedTaskAtoms: new WeakerSet<TaskAtom<any>>(relatedTaskAtoms) },
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

function recordSubscribableToContext<T>(subscribable: TaskAtom<T>, context: TaskExecutor) {
  context.relatedTaskAtoms.add(subscribable)
}

function isExecutorVisiable(context: TaskExecutor) {
  return [...context.relatedTaskAtoms].some((subscribable) => subscribable.visiable())
}

/** **only place** to invoke task executor */
export function invokeExecutor(executor: TaskExecutor) {
  if (executor.visiable) {
    asyncInvoke(executor)
  }
}
