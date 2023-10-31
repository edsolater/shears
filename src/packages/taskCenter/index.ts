import { map } from '@edsolater/fnkit'

type TaskKey = string
type TaskPayload = any
type TaskResultFromQueue = any
type TaskAction<Result> = (result: Result) => void
type TaskController = {
  /** remove from queue */
  cancel: () => void
}
type TaskQueueHandler = (payloads: Set<TaskPayload>) => Map<TaskPayload, TaskController>

function taskCenter<Config1 extends Record<TaskKey, { payload: TaskPayload; result: any }>>(
  config: Record<keyof Config1, TaskQueueHandler>,
) {
  type Config = {
    [K in keyof Config1]: {
      payload: Config1[K]['payload']
      result: Config1[K]['result']
      queueHandler: TaskQueueHandler
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
