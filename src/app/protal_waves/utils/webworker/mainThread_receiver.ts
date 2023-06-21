import { isFunction } from '@edsolater/fnkit'
import { decode } from '../dataTransmit/handlers'
import { WorkerDescription, WorkerMessage } from './type'
import { Subscribable } from '../../../../packages/fnkit'
import { isReceiveMessage } from './getMessageReceiver'

export const sdkworker = import('./worker_sdk?worker').then((module) => new module.default())

export type WebworkerSubscribeCallback<ResultData = any> = (
  data: ResultData,
) => void | ((newData: ResultData) => void) /* clean fn */

/**
 * @deprecated prefer use {@link subscribeWebWorker}
 */
export function subscribeWebWorker_Drepcated<ResultData = any, PostOptions = any>(
  message: { command: WorkerDescription; payload?: PostOptions },
  callback?: WebworkerSubscribeCallback<ResultData>,
): { abort(): void } {
  let cleanFn: ((newData: ResultData) => void) | void | undefined = undefined
  sdkworker.then((worker) => worker.postMessage(message))
  const messageHandler = (ev: MessageEvent<any>): void => {
    const body = ev.data as WorkerMessage<ResultData>
    if (isReceiveMessage(body) && body.command === message.command) {
      const decodedData = decode(body.payload)
      console.log('decodedData: ', decodedData)
      // LOG
      // console.log(`receving ${message.description}...`, 'from', body.data, 'to', decodedData)
      if (isFunction(cleanFn)) cleanFn(decodedData)
      const newCleanFn = callback?.(decodedData)
      cleanFn = newCleanFn
    }
  }
  // TODO: this will regist multi time, only need regist one time d
  sdkworker.then((worker) => worker.addEventListener('message', messageHandler))
  return {
    abort: () => {
      sdkworker.then((worker) => worker.removeEventListener('message', messageHandler))
    },
  }
}

/**
 * a command sender and a receiver in mainThread-side
 *
 * pass a command to webworker
 * @param messageDescription command
 * @param query payload
 * @returns a subscribable, which will emit the result data
 * @deprecated also is old, prefer use {@link getWorkerMessageListener}
 */
export function subscribeWebWorker<ResultData = any, PostOptions = any>(
  messageDescription: WorkerDescription,
  query: PostOptions,
) {
  const subscribable = new Subscribable<ResultData>()
  sdkworker.then((worker) => worker.postMessage({ command: messageDescription, payload: query }))
  const messageHandler = (ev: MessageEvent<any>): void => {
    const body = ev.data as WorkerMessage<ResultData>
    if (isReceiveMessage(body) && body.command === messageDescription) {
      const decodedData = decode(body.payload)
      // LOG
      // console.log(`receving ${message.description}...`, 'from', body.data, 'to', decodedData)
      subscribable.inject(decodedData)
    }
  }
  // TODO: this will regist multi time, only need regist one time d
  sdkworker.then((worker) => worker.addEventListener('message', messageHandler))
  return Object.assign(subscribable, {
    abort: () => {
      sdkworker.then((worker) => worker.removeEventListener('message', messageHandler))
    },
  })
}
