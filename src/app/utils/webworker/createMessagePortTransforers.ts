import { MayPromise, Subscribable, createSubscribable, hasProperty } from '@edsolater/fnkit'
import { cacheMapGet } from '../../../packages/fnkit'
import { decode, encode } from '../dataTransmit/handlers'

export interface ReceiveMessage<Data = any> {
  command: string
  payload: Data
}
/** used when don't need any query payloads */
export type EmptyQuery = unknown
export interface SenderMessage<Query = any> {
  command: string
  payload?: Query
}
export type Receiver<R extends ReceiveMessage> = Subscribable<R['payload']>
export type Sender<P extends SenderMessage, R extends ReceiveMessage = any> = {
  query(payload?: P['payload']): Receiver<R>
}
export type GetMessagePortFn<Payload = any, Query = any> = (command: string) => {
  receiver: Receiver<ReceiveMessage<Payload>>
  sender: Sender<SenderMessage<Query>, any>
}
export type GetMessageReceiverFn<Payload = any> = (command: string) => Receiver<ReceiveMessage<Payload>>
export type GetMessageSenderFn<Query = any> = (command: string) => Sender<SenderMessage<Query>, any>
export type MessagePortTransformers<Payload = any, Query = any> = {
  getMessageReceiver: GetMessageReceiverFn<Payload>
  getMessageSender: GetMessageSenderFn<Query>
  getMessagePort: GetMessagePortFn<Payload, Query>
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

export function createMessagePortTransforers(towrardsTarget: MayPromise<Worker | ServiceWorker | typeof globalThis>): {
  getMessageReceiver: <Payload = any>(command: string) => Receiver<ReceiveMessage<Payload>>
  getMessageSender: <Query = any>(command: string) => Sender<SenderMessage<Query>, any>
  getMessagePort: <Payload = any, Query = any>(
    command: string,
  ) => { receiver: Receiver<ReceiveMessage<Payload>>; sender: Sender<SenderMessage<Query>, any> }
} {
  const getReceiver = <Payload = any>(command: string) =>
    createMessageReceiver<ReceiveMessage<Payload>>(towrardsTarget, command)
  const getSender = <Query = any>(command: string) => createMessageSender<SenderMessage<Query>>(towrardsTarget, command)
  const getPort = <Payload = any, Query = any>(command: string) => ({
    receiver: getReceiver<Payload>(command),
    sender: getSender<Query>(command),
  })
  return { getMessageReceiver: getReceiver, getMessageSender: getSender, getMessagePort: getPort }
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
    const subscribable = createSubscribable<R['payload']>()
    const messageHandler = (ev: MessageEvent<any>): void => {
      const body = ev.data as ReceiveMessage<R['payload']>
      if (body.command === command) {
        const decodedData = decode(body.payload, { mutate: true })
        subscribable.set(decodedData)
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
        return createMessageReceiver(towardsTarget, command)
      },
    }
  }
  return cacheMapGet(registeredWorkerMessageSender, command, () => createNewWorkerMessageSender<P>(command))
}
