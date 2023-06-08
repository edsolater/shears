import { MayPromise } from '@edsolater/fnkit'
import { cachelyGetMapValue } from '../../../../packages/fnkit/cachelyGetMapValue'
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
 * @param to function to get the worker instance
 * @param command an action id
 * @returns
 * @pureFN
 */
export function getMessageSender<P extends SenderMessage>(
  to: MayPromise<Worker | ServiceWorker | typeof globalThis>,
  command: string,
): WorkerMessageSender<P> {
  function createNewWorkerMessageSender<P extends SenderMessage>(command: string): WorkerMessageSender<P> {
    return {
      query(payload) {
        Promise.resolve(to).then((targetPort) => targetPort.postMessage({ command, payload: encode(payload) }))
      },
    }
  }
  return cachelyGetMapValue(registeredWorkerMessageSender, command, () => createNewWorkerMessageSender<P>(command))
}
