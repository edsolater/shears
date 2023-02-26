import { WorkerDescription, WorkerMessage } from './type'
import MyWorker from './worker_sdk?worker'

const worker = new MyWorker()

export function queryWebWorker<R = any>(description: WorkerDescription, data?: any): Promise<R> {
  return new Promise((resolve) => {
    worker.postMessage({ description, data })
    const messageHandler = (ev: MessageEvent<any>): void => {
      const block = ev.data as WorkerMessage<R>
      if (block.description === description) {
        resolve(block?.data)
        worker.removeEventListener('message', messageHandler)
      }
    }
    worker.addEventListener('message', messageHandler)
  })
}
