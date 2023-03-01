/// <reference lib="webworker" />
import './polyfill' // for DeFi base on Buffer, but it's nodejs build-in Buffer

import { registInWorker as pairRegist } from '../pairs/webworker'
import { registInWorker as tokenRegist } from '../tokens/webworker'
import { registInWorker as farmRegist } from '../farms/webworker'
import { WorkerDescription, WorkerMessage } from './type'

const callbackMap = new Map<string, (data: any) => any | Promise<any>>()

function initMessageReceiver() {
  globalThis.addEventListener('message', async (ev) => {
    const description = ev.data.description
    const data = ev.data.data
    const targetOnMessage = callbackMap.get(description)
    if (!targetOnMessage) return
    const returnData = await targetOnMessage(data)
    globalThis.postMessage({ description, data: returnData } as WorkerMessage)
  })
}

// only need to regist once in the worker thread
initMessageReceiver()

export function registMessageReceiver<D = any>(
  description: WorkerDescription,
  onMessage: (data: D) => any | Promise<any>
) {
  callbackMap.set(description, onMessage)
}

tokenRegist()
pairRegist()
farmRegist()
