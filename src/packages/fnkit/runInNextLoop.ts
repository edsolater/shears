import { MayPromise } from '@edsolater/fnkit'

type TaskPayload = any
type TaskResult = any
type TaskHandler<TaskPayload = any, TaskResult = any> = (
  payloads: Set<TaskPayload>,
) => MayPromise<Map<TaskPayload, TaskResult>>

const _taskPayloadCenter = new WeakMap<TaskHandler, Set<TaskPayload>>()
const _taskResultPromiseHandler = new WeakMap<
  TaskPayload,
  { resolve: (resolve: TaskResult) => void; reject: (reason?: unknown) => void }
>()
const _taskHandlersTimoutids = new WeakMap<TaskHandler, ReturnType<typeof setTimeout>>()

/** it is for batch multi single tasks in to a big one */
export function runInNextLoop<Payload, Result>(
  taskHandler: TaskHandler<Payload, Result>,
  taskPayload: Payload,
): Promise<Result> {
  // add To queue
  _taskPayloadCenter.set(taskHandler, new Set(_taskPayloadCenter.get(taskHandler)).add(taskPayload))

  const promiseResult = new Promise((resolve, reject) => {
    _taskResultPromiseHandler.set(taskPayload, { resolve, reject })
  }) as Promise<Result>

  function getResultFromHandlerResult(results: Map<Payload, Result>) {
    const thisResult = results.get(taskPayload)
    const promiseHandlers = _taskResultPromiseHandler.get(taskPayload)
    if (!promiseHandlers) {
      throw new Error('no promiseHandlers, why?')
    } else {
      if (results.has(taskPayload)) {
        promiseHandlers.resolve(thisResult)
      } else {
        promiseHandlers.reject('opps, fail to load result')
      }
    }
  }
  clearTimeout(_taskHandlersTimoutids.get(taskHandler))
  const newTimeoutid = setTimeout(async () => {
    // run in next event loop
    // function run task
    const payloads = _taskPayloadCenter.get(taskHandler)
    if (payloads?.size) {
      const returnedResult = await taskHandler(payloads)
      getResultFromHandlerResult(returnedResult)
    }
    _taskPayloadCenter.delete(taskHandler)
    _taskHandlersTimoutids.delete(taskHandler)
  }, 0)
  _taskHandlersTimoutids.set(taskHandler, newTimeoutid)

  return promiseResult
}
