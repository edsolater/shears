import { MayPromise, Subscribable, createSubscribable, hasProperty } from '@edsolater/fnkit'
import { cacheMapGet } from '../../../packages/fnkit'
import { decode, encode } from '../dataTransmit/handlers'

interface ReceiveMessage<Data = any> {
  command: string
  payload: Data
}
interface SenderMessage<Query = any> {
  command: string
  payload?: Query
}
type Receiver<R extends ReceiveMessage> = Subscribable<R['payload']>
type Sender<P extends SenderMessage> = {
  query(payload: P['payload']): void
  // onMessageBack(payload: any): Promise<unknown> //TODO: imply it later
}

// store all registered message receivers
const registeredWorkerMessageReceiver = new Map<string, Receiver<any>>()
// store all registered message senders
const registeredWorkerMessageSender = new Map<string, Sender<any>>()

/**
 * type guard
 */
export function isSenderMessage(v: unknown): v is SenderMessage {
  return hasProperty(v, 'command')
}

/**
 * type guard
 */
export function isReceiveMessage(v: unknown): v is ReceiveMessage {
  return hasProperty(v, 'command') && hasProperty(v, 'payload')
}

export function createMessagePortTransforers<
  PortMessage extends { receiverMessage: ReceiveMessage; senderMessage: SenderMessage },
>(towrardsTarget: MayPromise<Worker | ServiceWorker | typeof globalThis>) {
  const getReceiver = (command: string) =>
    createMessageReceiver<PortMessage['receiverMessage']>(towrardsTarget, command)
  const getSender = (command: string) => createMessageSender<PortMessage['senderMessage']>(towrardsTarget, command)
  
  return { getReceiver, getSender }
}

/**
 * get(may auto create) a message receiver
 * @param towardsTarget function to get the worker instance
 * @param receiverCommand an action id
 * @returns a subscribable object, which can be subscribed to get the data from worker
 * @pureFN
 */
function createMessageReceiver<R extends ReceiveMessage>(
  towardsTarget: MayPromise<Worker | ServiceWorker | typeof globalThis>,
  receiverCommand: string,
): Receiver<R> {
  /**
   *
   * @param command one message command combine one message receiver
   * @returns subscribable
   */
  function createNewMessageReceiver<R extends ReceiveMessage>(command: string): Receiver<R> {
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

/**
 *
 * @param towardsTarget function to get the worker instance
 * @param command an action id
 * @returns
 * @pureFN
 */
function createMessageSender<P extends SenderMessage>(
  towardsTarget: MayPromise<Worker | ServiceWorker | typeof globalThis>,
  command: string,
): Sender<P> {
  function createNewWorkerMessageSender<P extends SenderMessage>(command: string): Sender<P> {
    return {
      query(payload) {
        Promise.resolve(towardsTarget).then((targetPort) =>
          targetPort.postMessage({ command, payload: encode(payload) }),
        )
      },
    }
  }
  return cacheMapGet(registeredWorkerMessageSender, command, () => createNewWorkerMessageSender<P>(command))
}
