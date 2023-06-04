import { MayPromise } from '@edsolater/fnkit'
import { cachelyGetMapValue } from '../../../../packages/fnkit/cachelyGetMapValue'
import { Subscribable } from '../../../../packages/fnkit/customizedClasses/Subscribable'
import { decode } from '../structure-clone/decode'

interface ReceiveMessage<Data = any> {
  command: string
  data: Data
}

export function isReceiveMessage(v: unknown): v is ReceiveMessage {
  return typeof v === 'object' && v !== null && 'command' in v && 'data' in v
}

type WorkerMessageReceiver<R extends ReceiveMessage> = Subscribable<R['data']>

// cache store
const registeredWorkerMessageReceiver = new Map<string, WorkerMessageReceiver<any>>()

/**
 * receive data from worker
 * @param getWorkerInstance function to get the worker instance
 * @param command an action id
 * @returns a subscribable object, which can be subscribed to get the data from worker
 * @pureFN
 */
export function getWorkerMessageReceiver<R extends ReceiveMessage>(
  getWorkerInstance: () => MayPromise<Worker | ServiceWorker | Window>,
  command: string,
): WorkerMessageReceiver<R> {
  function createNewWorkerMessageReceiver<R extends ReceiveMessage>(command: string): WorkerMessageReceiver<R> {
    const subscribable = new Subscribable<R['data']>()
    const messageHandler = (ev: MessageEvent<any>): void => {
      const body = ev.data as ReceiveMessage<R['data']>
      if (body.command === command) {
        const decodedData = decode(body.data)
        // LOG
        // console.log(`receving ${message.description}...`, 'from', body.data, 'to', decodedData)
        subscribable.inject(decodedData)
      }
    }
    Promise.resolve(getWorkerInstance()).then((worker) =>
      worker.addEventListener('message', messageHandler as any /*  seems it's typescript's fault */),
    )
    return subscribable
  }

  return cachelyGetMapValue(registeredWorkerMessageReceiver, command, () => createNewWorkerMessageReceiver<R>(command))
}
