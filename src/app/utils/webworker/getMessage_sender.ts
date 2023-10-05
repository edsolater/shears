import { MayPromise } from '@edsolater/fnkit'
import { cacheMapGet } from '../../../packages/fnkit'
import { encode } from '../dataTransmit/handlers'

interface SenderMessage<Query = any> {
  command: string
  payload?: Query
}

export function isSenderMessage(v: unknown): v is SenderMessage {
  return typeof v === 'object' && v !== null && 'command' in v
}
/**
 * send a command to webworker
 */
interface WorkerMessageSender<P extends SenderMessage> {
  query(payload: P['payload']): void
  // onMessageBack(payload: any): Promise<unknown> //TODO: imply it later
}
// cache store
const registeredWorkerMessageSender = new Map<string, WorkerMessageSender<any>>()

/**
 *
 * @param towardsTarget function to get the worker instance
 * @param command an action id
 * @returns
 * @pureFN
 */
export function getMessageSender<P extends SenderMessage>(
  towardsTarget: MayPromise<Worker | ServiceWorker | typeof globalThis>,
  command: string,
): WorkerMessageSender<P> {
  function createNewWorkerMessageSender<P extends SenderMessage>(command: string): WorkerMessageSender<P> {
    return {
      query(payload) {
        Promise.resolve(towardsTarget).then((targetPort) => targetPort.postMessage({ command, payload: encode(payload) }))
      },
    }
  }
  return cacheMapGet(registeredWorkerMessageSender, command, () => createNewWorkerMessageSender<P>(command))
}
