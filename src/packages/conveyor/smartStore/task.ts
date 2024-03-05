/**
 * *********
 * observe user action towards the object|function
 * *********
 */
import { shrinkFn } from "@edsolater/fnkit"
import { assignObject } from "../../fnkit/assignObject"
import { Shuck, attachTaskToShuck, isShuckVisiable } from "./shuck"

export type TaskRunner = {
  (): void
  relatedShucks: Shuck<any>[]
  readonly visiable: boolean // TODO: need to be a subscribable
}
export type TaskManager = {
  // main method of task, run if needed (any of shucks is visiable)
  run(): void
  taskRunner: TaskRunner
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
  dependOns: Shuck<any>[],
  task: () => void,
  options?: { visiable?: boolean | ((shucks: Shuck<any>[]) => boolean) },
) {
  const taskRunner = (() => task()) as TaskRunner
  assignObject(taskRunner, {
    relatedShucks: dependOns,
    get visiable() {
      return shrinkFn(options?.visiable, [dependOns]) ?? dependOns.some(isShuckVisiable)
    },
  })
  for (const shuck of dependOns) {
    attachTaskToShuck(taskRunner, shuck) // task is triggered by subscribed shucks, but also attach shack to taskRunner make it easy to debug (easy for human to monitor the app tasks)
  }
  const manager: TaskManager = {
    taskRunner,
    run(config?: { force?: boolean }) {
      if (config?.force ?? taskRunner.visiable) taskRunner()
    },
  }
  manager.run() // initly run the task
  return manager
}
