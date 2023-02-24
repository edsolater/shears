/// <reference lib="webworker" />

import { WorkerMessage } from './type'

const callbackMap = new Map<string, (data: any) => any>()

function initMessageReceiver() {
  globalThis.addEventListener('message', (ev) => {
    const description = ev.data.description
    const data = ev.data.data
    const targetOnMessage = callbackMap.get(description)
    if (!targetOnMessage) {
      console.warn(`unknown message: ${description}`, data)
      return
    }
    const returnData = targetOnMessage(data)
    globalThis.postMessage({ description, data: returnData } as WorkerMessage)
  })
}

// only need to regist once
initMessageReceiver()

function registMessageReceiver<T = any>(description: string, onMessage: (data: T) => any) {
  callbackMap.set(description, onMessage)
}
registMessageReceiver('getInfo', (data) => {
  console.log('sdk-thread:  ', data)
  return 'hello from sdk-thread'
})
