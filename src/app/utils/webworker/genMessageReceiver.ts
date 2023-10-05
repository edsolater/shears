import { MayPromise, Subscribable, createSubscribable } from '@edsolater/fnkit'
import { cacheMapGet } from '../../../packages/fnkit'
import { decode } from '../dataTransmit/handlers'

interface ReceiveMessage<Data = any> {
  command: string
  payload: Data
}
type MessageReceiver<R extends ReceiveMessage> = Subscribable<R['payload']>

// cache store to record all registered message receivers
const registeredWorkerMessageReceiver = new Map<string, MessageReceiver<any>>()

export function isReceiveMessage(v: unknown): v is ReceiveMessage {
  return (
    typeof v === 'object' &&
    v !== null &&
    ('command' satisfies keyof ReceiveMessage) in v &&
    ('payload' satisfies keyof ReceiveMessage) in v
  )
}

/**
 * get(may auto create) a message receiver
 * @param towardsTarget function to get the worker instance
 * @param receiverCommand an action id
 * @returns a subscribable object, which can be subscribed to get the data from worker
 * @pureFN
 */
export function getMessageReceiver<R extends ReceiveMessage>(
  towardsTarget: MayPromise<Worker | ServiceWorker | typeof globalThis>,
  receiverCommand: string,
): MessageReceiver<R> {
  /**
   *
   * @param command one message command combine one message receiver
   * @returns subscribable
   */
  function createNewMessageReceiver<R extends ReceiveMessage>(command: string): MessageReceiver<R> {
    const [subscribable, inject] = createSubscribable<R['payload']>()
    const messageHandler = (ev: MessageEvent<any>): void => {
      const body = ev.data as ReceiveMessage<R['payload']>
      if (body.command === command) {
        const decodedData = decode(body.payload)
        inject(decodedData)
      }
    }
    Promise.resolve(towardsTarget).then((worker) =>
      worker.addEventListener('message', messageHandler as any /*  seems it's typescript's fault */),
    )
    return subscribable
  }

  return cacheMapGet(registeredWorkerMessageReceiver, receiverCommand, () =>
    createNewMessageReceiver<R>(receiverCommand),
  )
}
