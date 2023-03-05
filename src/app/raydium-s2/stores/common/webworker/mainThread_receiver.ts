import { isFunction } from '@edsolater/fnkit'
import { WorkerDescription, WorkerMessage } from './type'
import MyWorker from './worker_sdk?worker'

const worker = new MyWorker()

export type QueryCallback<ResultData = any> = (data: ResultData) => void | ((newData: ResultData) => void) /* clean fn */;

export function queryWebWorker<ResultData = any, PostOptions = any>(
  message: { description: WorkerDescription; payload?: PostOptions },
  callback?: QueryCallback<ResultData>
): void {
  let cleanFn: ((newData: ResultData) => void) | void | undefined = undefined
  worker.postMessage(message)
  const messageHandler = (ev: MessageEvent<any>): void => {
    const body = ev.data as WorkerMessage<ResultData>
    if (body.description === message.description) {
      if (isFunction(cleanFn)) cleanFn(body.data)
      const newCleanFn = callback?.(body.data)
      cleanFn = newCleanFn
    }
  }
  worker.addEventListener('message', messageHandler)
}
