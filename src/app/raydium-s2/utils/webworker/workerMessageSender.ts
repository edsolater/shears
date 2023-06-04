import { MayPromise } from '@edsolater/fnkit'
import { cachelyGetMapValue } from '../../../../packages/fnkit/cachelyGetMapValue'

interface SenderMessage<Payload = any> {
  command: string
  payload?: Payload
}

export function isSenderMessage(v: unknown): v is SenderMessage {
  return typeof v === 'object' && v !== null && 'command' in v
}
/**
 * send a command to webworker
 */
interface WorkerMessageSender<P extends SenderMessage> {
  query(payload: P['payload']): void
}
// cache store
const registeredWorkerMessageSender = new Map<string, WorkerMessageSender<any>>()

/**
 *
 * @param getWorkerInstance function to get the worker instance
 * @param command an action id
 * @returns
 * @pureFN
 */
export function getWorkerMessageSender<P extends SenderMessage>(
  getWorkerInstance: () => MayPromise<Worker | ServiceWorker | Window>,
  command: string,
): WorkerMessageSender<P> {
  function createNewWorkerMessageSender<P extends SenderMessage>(command: string): WorkerMessageSender<P> {
    return {
      query(payload) {
        Promise.resolve(getWorkerInstance()).then((worker) => worker.postMessage({ description: command, payload }))
      },
    }
  }
  return cachelyGetMapValue(registeredWorkerMessageSender, command, () => createNewWorkerMessageSender<P>(command))
}
