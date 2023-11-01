import { MayPromise, map } from '@edsolater/fnkit'
import { P } from 'vitest/dist/reporters-5f784f42'

type TaskKey = string
type TaskPayload = any
type TaskResult = any
type TaskResultFromQueue = any
type TaskAction<Result = any> = (result: Result) => void
type TaskController = {
  /** remove from queue */
  cancel: () => void
}
type TaskHandler<TaskPayload = any, TaskResult = any> = (
  payloads: Set<TaskPayload>,
) => MayPromise<Map<TaskPayload, TaskResult>>

function taskCenter<Config1 extends Record<TaskKey, { payload: TaskPayload; result: any }>>(
  config: Record<keyof Config1, TaskHandler>,
) {
  type Config = {
    [K in keyof Config1]: {
      payload: Config1[K]['payload']
      result: Config1[K]['result']
      queueHandler: TaskHandler
    }
  }

  const innerTaskStore = new Map<
    keyof Config,
    Set<{ payload: TaskPayload; task: (result: TaskResultFromQueue) => void }>
  >()

  function addTask<K extends keyof Config>(
    taskKey: K,
    payload: Config[K]['payload'],
    task: (result: Config[K]['result']) => void,
  ) {
    if (!innerTaskStore.has(taskKey)) {
      innerTaskStore.set(taskKey, new Set())
    }
    const taskQueue = innerTaskStore.get(taskKey)!
    const item = { payload, task }
    taskQueue.add(item)
    runTask(taskKey)
    return () => {
      taskQueue.delete(item)
    }
  }

  let lastTimeoutId: ReturnType<typeof setTimeout> | null = null
  function runTask(taskKey: keyof Config) {
    if (lastTimeoutId) {
      clearTimeout(lastTimeoutId)
    }
    lastTimeoutId = setTimeout(() => {
      const handler = config[taskKey]
      const taskQueue = innerTaskStore.get(taskKey)
      if (taskQueue?.size) {
        const payloads = map(taskQueue, (item) => item.payload)
      }
    }, 0)
  }
  return {
    addTask,
  }
}

const _taskCenter = new WeakMap<TaskHandler, Set<TaskPayload>>()
const _taskHandlersTimoutids = new WeakMap<TaskHandler, ReturnType<typeof setTimeout>>()
export function runInNextLoop<Payload, Result>(
  taskHandler: TaskHandler<Payload, Result>,
  taskPayload: Payload,
): Promise<Result> {
  _taskCenter.set(taskHandler, new Set(_taskCenter.get(taskHandler)).add(taskPayload)

  clearTimeout(_taskHandlersTimoutids.get(taskHandler))
  const newTimeoutid = setTimeout(() => {
    const payloads = _taskCenter.get(taskHandler)
    if (payloads?.size) {
      taskHandler(payloads)
    }
    _taskCenter.delete(taskHandler)
    _taskHandlersTimoutids.delete(taskHandler)
  }, 0)
  _taskHandlersTimoutids.set(taskHandler, newTimeoutid)
}
