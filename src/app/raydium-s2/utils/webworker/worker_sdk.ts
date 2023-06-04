/// <reference lib="webworker" />
import './worker_polyfill' // for DeFi base on Buffer, but it's nodejs build-in Buffer

import { Subscribable } from '../../../../packages/fnkit/customizedClasses/Subscribable'
import { invoke } from '../../../../packages/fnkit/invoke'
import { encode } from '../structure-clone/encode'
import { WorkerDescription, WorkerMessage } from './type'
import { applyWebworkerRegisters } from './worker_registers'

type onMessage<D> = (utils: { payload: D; resolve(value: any): void }) => void

const callbackMap = new Map<string, onMessage<any>>()
const returnValueMap = new WeakMap<onMessage<any>, Subscribable<any>>()

/**
 *
 * register receiver utils in worker-side
 */
function initMessageReceiver() {
  globalThis.addEventListener('message', async (ev) => {
    const description = ev.data.description
    const payload = ev.data.payload
    const onMessage = callbackMap.get(description)
    if (!onMessage) return

    const subscribable = new Subscribable()
    returnValueMap.set(onMessage, subscribable)

    invoke(onMessage, { payload, resolve: subscribable.inject.bind(subscribable) })
    returnValueMap.get(onMessage)?.subscribe((outputData) => {
      /**  need {@link encode}, so not `encode(returnData)` */
      const encodedData = encode(outputData)
      // LOG
      // console.log(`transforming ${description}...`, outputData, 'to', encodedData)
      globalThis.postMessage({ description, data: encodedData } as WorkerMessage)
    })
  })
}

// only need to regist once in the worker thread
initMessageReceiver()

export function registMessageReceiver<D = any>(description: WorkerDescription, onMessage: onMessage<D>) {
  callbackMap.set(description, onMessage)
}

applyWebworkerRegisters()
