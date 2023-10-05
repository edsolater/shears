import { MayPromise, Subscribable, createSubscribable } from '@edsolater/fnkit'
import { cacheMapGet } from '../../../packages/fnkit'
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
 * @param towards function to get the worker instance
 * @param command an action id
 * @returns a subscribable object, which can be subscribed to get the data from worker
 * @pureFN
 */
export function getMessageReceiver<R extends ReceiveMessage>(
  towards: MayPromise<Worker | ServiceWorker | typeof globalThis>,
  command: string,
): WorkerMessageReceiver<R> {
  /**
   *
   * @param command one message command combine one message receiver
   * @returns subscribable
   */
  function createNewMessageReceiver<R extends ReceiveMessage>(command: string): WorkerMessageReceiver<R> {
    const [subscribable, inject] = createSubscribable<R['payload']>()
    const messageHandler = (ev: MessageEvent<any>): void => {
      const body = ev.data as ReceiveMessage<R['payload']>
      if (body.command === command) {
        const decodedData = decode(body.payload)
        inject(decodedData)
      }
    }
    Promise.resolve(towards).then((worker) =>
      worker.addEventListener('message', messageHandler as any /*  seems it's typescript's fault */),
    )
    return subscribable
  }

  return cacheMapGet(registeredWorkerMessageReceiver, command, () => createNewMessageReceiver<R>(command))
}
