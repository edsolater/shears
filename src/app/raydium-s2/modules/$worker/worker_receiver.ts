import MyWorker from './worker_sdk?worker'
import { WorkerMessage, WorkerDescription } from './type'
import { TokenJson } from 'test-raydium-sdk-v2'

const worker = new MyWorker()

function queryWebWorker<R = any>(description: WorkerDescription, data?: any): Promise<R> {
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

//TODO: should move to `/tokens`
export function getTokens() {
  return queryWebWorker<TokenJson[]>('sdk tokens')
}