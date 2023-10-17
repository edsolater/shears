import { AnyFn } from '@edsolater/fnkit'
import { PromiseWithInjecters, createPromiseWithInjecters } from './createPromiseWithInjecters'

const allRegistedTasks = new Map<any, AnyFn>()
const allTaskResult = new WeakMap<AnyFn, PromiseWithInjecters>()
function runTaskInMicro() {
  allRegistedTasks.forEach((cb, key) => {
    const calbackResult = cb()
    const promiseWithInjecters = allTaskResult.get(cb)
    if (promiseWithInjecters) {
      promiseWithInjecters.resolve(calbackResult)
    }
    allRegistedTasks.delete(key)
  })
}
/**
 * same function will invoke only once in micro task loop
 * @param cb callback need to invoke in micro task
 * @returns promise of callback result
 */
export function invokeInMicroTaskLoop<F extends AnyFn>(
  cb: F,
  options?: {
    /**
     * any Map key is acceptable
     * default is cb itself
     */
    taskKey?: any
  },
): Promise<ReturnType<F>> {
  if (!allRegistedTasks.has(cb)) {
    const taskKey = options?.taskKey ?? cb
    allRegistedTasks.set(taskKey, cb)
    allTaskResult.set(cb, createPromiseWithInjecters<ReturnType<F>>())
    Promise.resolve().then(runTaskInMicro)
  }
  return allTaskResult.get(cb)!.promise
}
