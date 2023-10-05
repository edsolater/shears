import { createSubscribable, isFunction } from '@edsolater/fnkit'
import { decode } from '../dataTransmit/handlers'
import { createSignTransactionPortInMainThread } from '../txHandler/signAllTransactions_main'
import { createMessagePortTransforers, isReceiveMessage } from './createMessagePortTransforers'
import { WorkerCommand, WorkerMessage } from './type'

export const sdkworker = import('./loadSDKWorker?worker').then((module) => new module.default())
export const { getReceiver: getMessageReceiver, getSender: getMessageSender } = createMessagePortTransforers(sdkworker)

createSignTransactionPortInMainThread()

export type WebworkerSubscribeCallback<ResultData = any> = (
  data: ResultData,
) => void | ((newData: ResultData) => void) /* clean fn */

export function subscribeWebWorker_Drepcated<ResultData = any, PostOptions = any>(
  message: { command: WorkerCommand; payload?: PostOptions },
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
 * @param command command
 * @param query payload
 * @returns a subscribable, which will emit the result data
 * @deprecated also is old, prefer use {@link getMessageReceiver}
 */
export function openMessagePortToWorker<ResultData = any, PostOptions = any>(
  command: WorkerCommand,
  query: PostOptions,
  option?: {
    /** no need log */
    mute?: boolean
  },
) {
  const [subscribable, inject] = createSubscribable<ResultData>()
  sdkworker.then((worker) => worker.postMessage({ command: command, payload: query }))
  const messageHandler = (ev: MessageEvent<any>): void => {
    const body = ev.data as WorkerMessage<ResultData>
    if (isReceiveMessage(body) && body.command === command) {
      const decodedData = decode(body.payload)
      if (!option?.mute) {
        console.log(`[main thread]${command}: ${decodedData}`)
      }
      inject(decodedData)
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
