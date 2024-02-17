/**
 * *********
 * observe user action towards the object|function
 * *********
 */
import { WeakerSet } from '@edsolater/fnkit'
import { assignObject } from '../../fnkit/assignObject'
import { asyncInvoke } from '../../pivkit/hooks/createContextStore/utils/asyncInvoke'
import { Shuck, isShuckVisiable, recordSubscribableToAtom } from './shuck'

export type TaskRunner = {
  (): void
  relatedShucks: WeakerSet<Shuck<any>>
  readonly visiable: boolean // TODO: need to be a subscribable
}
export type TaskManager = {
  // main method of task, force to run the effect
  run(): void
  // main method of task, run if needed (any of shucks is visiable)
  register(): void
  taskRunner: TaskRunner
  observe(...shucks: Shuck<any>[]): void
}

/**
 * like solidjs's createEffect, will track all subscribable's getValue option in it
 * try to re-invoke when shunk's value or shuck's visiablity changed
 *
 * when relatedShucks is hinted, task function will only run when relatedShucks is visiable
 * otherwise, initly task function must it to track the subscribables
 *
 *
 * @example
 * const testObserverableSubscribable = createLeaf(1)
 * const testObserverableSubscribableB = createLeaf(1, { visiable: true })
 *
 * const task = createTask([testObserverableSubscribable, testObserverableSubscribableB], async (get) => {
 *   await Promise.resolve(3)
 * })
 */
// param:shucks should can be a object that {}
export function createTask(
  dependOns: (Shuck<any> )[],
  task: () => void,
  options?: { visiable?: boolean },
) {
  const taskRunner = (() => task()) as TaskRunner
  assignObject(taskRunner, {
    relatedShucks: new WeakerSet<Shuck<any>>(dependOns),
    get visiable() {
      return isTaskRunnerVisiable(taskRunner)
    },
  })

  const manager: TaskManager = {
    run() {
      taskRunner()
    },
    taskRunner,
    register() {
      dependOns.forEach((shuck) => {
        recordSubscribableToTaskRunner(shuck, taskRunner)
        recordSubscribableToAtom(taskRunner, shuck) // task is triggered by subscribed shucks, but also attach shack to taskRunner make it easy to debug (easy for human to monitor the app tasks)
      })
      if (isTaskRunnerVisiable(taskRunner)) taskRunner()
    },
    observe(...shucks: Shuck<any>[]) {
      shucks.forEach((shuck) => {
        recordSubscribableToTaskRunner(shuck, taskRunner)
        recordSubscribableToAtom(taskRunner, shuck)
      })
      if (shucks.some(isShuckVisiable)) {
        taskRunner()
      }
    },
  }
  return manager
}

export function registerTask(shucks: Shuck<any>[], task: () => void) {
  const manager = createTask(shucks, task)
  return manager.register()
}

function recordSubscribableToTaskRunner<T>(subscribable: Shuck<T>, context: TaskRunner) {
  context.relatedShucks.add(subscribable)
}

/** task is visiable when any  */
function isTaskRunnerVisiable(context: TaskRunner) {
  return true // test
  for (const shuck of context.relatedShucks) {
    if (isShuckVisiable(shuck)) return true
  }
  return false
}

/** **only place** to invoke task taskrunner */
export function invokeTaskRunner(taskrunner: TaskRunner) {
  if (taskrunner.visiable) {
    asyncInvoke(taskrunner)
  }
}
