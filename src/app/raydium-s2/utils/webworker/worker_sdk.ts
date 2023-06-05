/// <reference lib="webworker" />
import './worker_polyfill' // for DeFi base on Buffer, but it's nodejs build-in Buffer

import { Subscribable } from '../../../../packages/fnkit/customizedClasses/Subscribable'
import { invoke } from '../../../../packages/fnkit/invoke'
import { toTransiable } from '../dataTransmit/handlers'
import { WorkerDescription, WorkerMessage } from './type'
import { applyWebworkerRegisters } from './worker_registers'
import { isSenderMessage } from './getMessageSender'

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

    const subscribable = new Subscribable()
    returnValueMap.set(onMessage, subscribable)

    invoke(onMessage, { payload, resolve: subscribable.inject.bind(subscribable) })
    returnValueMap.get(onMessage)?.subscribe((outputData) => {
      /**  need {@link toTransiable}, so not `encode(returnData)` */
      const encodedData = toTransiable(outputData)
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
