import { MayPromise } from '@edsolater/fnkit'
import { Subscribable, cachelyGetMapValue } from '../../../packages/fnkit'
import { decode } from '../dataTransmit/handlers'

interface ReceiveMessage<Data = any> {
  command: string
  payload: Data
}

export function isReceiveMessage(v: unknown): v is ReceiveMessage {
  return (
    typeof v === 'object' &&
    v !== null &&
    ('command' satisfies keyof ReceiveMessage) in v &&
    ('payload' satisfies keyof ReceiveMessage) in v
  )
}

type WorkerMessageReceiver<R extends ReceiveMessage> = Subscribable<R['payload']>

// cache store
const registeredWorkerMessageReceiver = new Map<string, WorkerMessageReceiver<any>>()

/**
 * receive data from worker
 * @param from function to get the worker instance
 * @param command an action id
 * @returns a subscribable object, which can be subscribed to get the data from worker
 * @pureFN
 */
export function getMessageReceiver<R extends ReceiveMessage>(
  from: MayPromise<Worker | ServiceWorker | typeof globalThis>,
  command: string,
): WorkerMessageReceiver<R> {
  function createNewWorkerMessageReceiver<R extends ReceiveMessage>(command: string): WorkerMessageReceiver<R> {
    const subscribable = new Subscribable<R['payload']>()
    const messageHandler = (ev: MessageEvent<any>): void => {
      const body = ev.data as ReceiveMessage<R['payload']>
      if (body.command === command) {
        const decodedData = decode(body.payload)
        subscribable.inject(decodedData)
      }
    }
    Promise.resolve(from).then((worker) =>
      worker.addEventListener('message', messageHandler as any /*  seems it's typescript's fault */),
    )
    return subscribable
  }

  return cachelyGetMapValue(registeredWorkerMessageReceiver, command, () => createNewWorkerMessageReceiver<R>(command))
}
