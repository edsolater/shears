import { isFunction } from '@edsolater/fnkit'
import { decode } from '../structure-clone/decode'
import { WorkerDescription, WorkerMessage } from './type'
import SDKWorker from './worker_sdk?worker'
import { Subscribable } from '../../../../packages/fnkit/customizedClasses/Subscribable'

const worker = new SDKWorker()

export type WebworkerSubscribeCallback<ResultData = any> = (
  data: ResultData
) => void | ((newData: ResultData) => void) /* clean fn */

/**
 * @deprecated prefer use {@link subscribeWebWorker}
 */
export function subscribeWebWorker_Drepcated<ResultData = any, PostOptions = any>(
  message: { description: WorkerDescription; payload?: PostOptions },
  callback?: WebworkerSubscribeCallback<ResultData>
): { abort(): void } {
  let cleanFn: ((newData: ResultData) => void) | void | undefined = undefined
  worker.postMessage(message)
  const messageHandler = (ev: MessageEvent<any>): void => {
    const body = ev.data as WorkerMessage<ResultData>
    if (body.description === message.description) {
      const decodedData = decode(body.data)
      // LOG
      // console.log(`receving ${message.description}...`, 'from', body.data, 'to', decodedData)
      if (isFunction(cleanFn)) cleanFn(decodedData)
      const newCleanFn = callback?.(decodedData)
      cleanFn = newCleanFn
    }
  }
  // TODO: this will regist multi time, only need regist one time d
  worker.addEventListener('message', messageHandler)
  return { abort: () => worker.removeEventListener('message', messageHandler) }
}

/**
 * pass a command to webworker
 * @param messageDescription command
 * @param query payload
 * @returns a subscribable, which will emit the result data
 */
export function subscribeWebWorker<ResultData = any, PostOptions = any>(
  messageDescription: WorkerDescription,
  query: PostOptions
) {
  const subscribable = new Subscribable<ResultData>()
  worker.postMessage({ description: messageDescription, payload: query })
  const messageHandler = (ev: MessageEvent<any>): void => {
    const body = ev.data as WorkerMessage<ResultData>
    if (body.description === messageDescription) {
      const decodedData = decode(body.data)
      // LOG
      // console.log(`receving ${message.description}...`, 'from', body.data, 'to', decodedData)
      subscribable.inject(decodedData)
    }
  }
  // TODO: this will regist multi time, only need regist one time d
  worker.addEventListener('message', messageHandler)
  return Object.assign(subscribable, { abort: () => worker.removeEventListener('message', messageHandler) })
}
