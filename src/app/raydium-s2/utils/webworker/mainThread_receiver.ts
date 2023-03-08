import { isFunction } from '@edsolater/fnkit'
import { decode } from '../structure-clone/decode'
import { WorkerDescription, WorkerMessage } from './type'
import SDKWorker from './worker_sdk?worker'

const worker = new SDKWorker()

export type WebworkerSubscribeCallback<ResultData = any> = (
  data: ResultData
) => void | ((newData: ResultData) => void) /* clean fn */

export function subscribeWebWorker<ResultData = any, PostOptions = any>(
  message: { description: WorkerDescription; payload?: PostOptions },
  callback?: WebworkerSubscribeCallback<ResultData>
): { abort(): void } {

  let cleanFn: ((newData: ResultData) => void) | void | undefined = undefined
  worker.postMessage(message)
  const messageHandler = (ev: MessageEvent<any>): void => {
    const body = ev.data as WorkerMessage<ResultData>
    if (body.description === message.description) {
      const decodedData = decode(body.data)
      if (isFunction(cleanFn)) cleanFn(decodedData)
      const newCleanFn = callback?.(decodedData)
      cleanFn = newCleanFn
    }
  }
  worker.addEventListener('message', messageHandler)
  return { abort: () => worker.removeEventListener('message', messageHandler) }
}