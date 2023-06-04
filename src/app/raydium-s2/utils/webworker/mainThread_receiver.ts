import { MayPromise, isFunction } from '@edsolater/fnkit'
import { decode } from '../structure-clone/decode'
import { WorkerDescription, WorkerMessage } from './type'
import { Subscribable } from '../../../../packages/fnkit/customizedClasses/Subscribable'

const workerP = import('./worker_sdk?worker').then((module) => new module.default())

export type WebworkerSubscribeCallback<ResultData = any> = (
  data: ResultData,
) => void | ((newData: ResultData) => void) /* clean fn */

/**
 * @deprecated prefer use {@link subscribeWebWorker}
 */
export function subscribeWebWorker_Drepcated<ResultData = any, PostOptions = any>(
  message: { description: WorkerDescription; payload?: PostOptions },
  callback?: WebworkerSubscribeCallback<ResultData>,
): { abort(): void } {
  let cleanFn: ((newData: ResultData) => void) | void | undefined = undefined
  workerP.then((worker) => worker.postMessage(message))
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
  workerP.then((worker) => worker.addEventListener('message', messageHandler))
  return {
    abort: () => {
      workerP.then((worker) => worker.removeEventListener('message', messageHandler))
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
  workerP.then((worker) => worker.postMessage({ description: messageDescription, payload: query }))
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
  workerP.then((worker) => worker.addEventListener('message', messageHandler))
  return Object.assign(subscribable, {
    abort: () => {
      workerP.then((worker) => worker.removeEventListener('message', messageHandler))
    },
  })
}

interface PostMessage<Payload = any> {
  command: string
  payload: Payload
}

/**
 * send a command to webworker
 */
interface WorkerMessageSender<P extends PostMessage> {
  query(payload: P['payload']): void
}

// cache store
const registeredWorkerMessageSender = new Map<string, WorkerMessageSender<any>>()

export function getWorkerMessageSender<P extends PostMessage>(
  getWorkerInstance: () => MayPromise<Worker>,
  command: string,
) {
  function createNewWorkerMessageSender<P extends PostMessage>(command: string): WorkerMessageSender<P> {
    return {
      query(payload) {
        Promise.resolve(getWorkerInstance()).then((worker) => worker.postMessage({ description: command, payload }))
      },
    }
  }
  return cachelyGetMapValue(registeredWorkerMessageSender, command, () => createNewWorkerMessageSender<P>(command))
}

// TODO: move to fnkit
type GetMapKey<T extends Map<any, any>> = T extends Map<infer K, any> ? K : never
// TODO: move to fnkit
type GetMapValue<T extends Map<any, any>> = T extends Map<any, infer V> ? V : never

/** basic util function
 * @todo move to fnkit
 */
function cachelyGetMapValue<T extends Map<any, any>>(
  cacheMap: T,
  key: GetMapKey<T>,
  createIfNotInCacheMap: () => GetMapValue<T>,
): GetMapValue<T> {
  if (!cacheMap.has(key)) {
    const newValue = createIfNotInCacheMap()
    cacheMap.set(key, newValue)
  }
  return cacheMap.get(key)!
}

interface ReceiveMessage<Data = any> {
  command: string
  receivedData: Data
}

type WorkerMessageReceiver<R extends ReceiveMessage> = Subscribable<R['receivedData']>

// cache store
const registeredWorkerMessageReceiver = new Map<string, WorkerMessageReceiver<any>>()

export function getWorkerMessageReceiver<R extends ReceiveMessage>(
  getWorkerInstance: () => MayPromise<Worker>,
  command: string,
) {
  function createNewWorkerMessageReceiver<R extends ReceiveMessage>(command: string): WorkerMessageReceiver<R> {
    const subscribable = new Subscribable<R['receivedData']>()
    const messageHandler = (ev: MessageEvent<any>): void => {
      const body = ev.data as WorkerMessage<R['receivedData']>
      if (body.description === command) {
        const decodedData = decode(body.data)
        // LOG
        // console.log(`receving ${message.description}...`, 'from', body.data, 'to', decodedData)
        subscribable.inject(decodedData)
      }
    }
    Promise.resolve(getWorkerInstance()).then((worker) => worker.addEventListener('message', messageHandler))
    return subscribable
  }

  return cachelyGetMapValue(registeredWorkerMessageReceiver, command, () => createNewWorkerMessageReceiver<R>(command))
}
