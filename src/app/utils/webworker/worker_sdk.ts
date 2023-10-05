/// <reference lib="webworker" />
import './worker_polyfill'; // for DeFi base on Buffer, but it's nodejs build-in Buffer

import { Subscribable, createSubscribable, invoke } from '../../../packages/fnkit'
import { encode } from '../dataTransmit/handlers'
import { isSenderMessage } from './getMessage_sender'
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
    const messageBody = ev.data
    if (!isSenderMessage(messageBody)) return
    const { command, payload } = messageBody
    const onMessage = callbackMap.get(command)
    if (!onMessage) return

    const [subscribable, inject] = createSubscribable()
    returnValueMap.set(onMessage, subscribable)

    invoke(onMessage, { payload, resolve: inject })
    returnValueMap.get(onMessage)?.subscribe((outputData) => {
      /**  need {@link encode}, so not `encode(returnData)` */
      const encodedData = encode(outputData)
      // LOG
      // console.log(`transforming ${description}...`, outputData, 'to', encodedData)
      globalThis.postMessage({ command, payload: encodedData } as WorkerMessage)
    })
  })
}

// only need to regist once in the worker thread
initMessageReceiver()

export function registMessageReceiver<D = any>(description: WorkerDescription, onMessage: onMessage<D>) {
  callbackMap.set(description, onMessage)
}

applyWebworkerRegisters()
