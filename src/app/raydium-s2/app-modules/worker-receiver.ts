import MyWorker from './worker-sdk?worker'
import { WorkerMessage, WorkerDescription } from './type'

const worker = new MyWorker()

function postMessage<R = any>(description: WorkerDescription, data: any): Promise<R> {
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

export function getInfo() {
  return postMessage('query token info', 'hello from main-thread').then((r) => console.log('main-thread: ', r))
}

