/// <reference lib="webworker" />
import './polyfill'
import { getRaydiumSDKRoot } from '../$root/utils/getRaydiumSDKRoot'
import { WorkerDescription, WorkerMessage } from './type'

const callbackMap = new Map<string, (data: any) => any | Promise<any>>()

function initMessageReceiver() {
  globalThis.addEventListener('message', async (ev) => {
    const description = ev.data.description
    const data = ev.data.data
    const targetOnMessage = callbackMap.get(description)
    if (!targetOnMessage) {
      console.warn(`unknown message: ${description}`, data)
      return
    }
    const returnData = await targetOnMessage(data)
    globalThis.postMessage({ description, data: returnData } as WorkerMessage)
  })
}

// only need to regist once in the worker thread
initMessageReceiver()

function registMessageReceiver<T = any>(description: WorkerDescription, onMessage: (data: T) => any | Promise<any>) {
  callbackMap.set(description, onMessage)
}

//TODO: should move to /tokens
registMessageReceiver('sdk tokens', async (data) => {
  const raydium = await getRaydiumSDKRoot()
  const allTokens = raydium.token.allTokens
  return allTokens
})
