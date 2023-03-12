/// <reference lib="webworker" />
import './worker_polyfill' // for DeFi base on Buffer, but it's nodejs build-in Buffer

import { registInWorker as pairRegist } from '../../stores/pairs/webworker'
import { registInWorker as tokenRegist } from '../../stores/tokens/webworker'
import { registInWorker as tokenPriceRegist } from '../../atoms/tokenPriceWorkerUtils'
import { registInWorker as farmRegist } from '../../stores/farms/webworker'

import { WorkerDescription, WorkerMessage } from './type'
import { invoke } from '../../../../packages/fnkit/invoke'
import { encode } from '../structure-clone/encode'

type onMessage<D> = (utils: { payload: D; onCleanUp(cleanFn: () => void): void; resolve(value: any): void }) => void

const callbackMap = new Map<string, onMessage<any>>()
const cleanFunctionMap = new WeakMap<onMessage<any>, (() => void)[]>()
const returnValueMap = new WeakMap<onMessage<any>, Promise<any>>()

function initMessageReceiver() {
  globalThis.addEventListener('message', async (ev) => {
    const description = ev.data.description
    const payload = ev.data.payload
    const onMessage = callbackMap.get(description)
    if (!onMessage) return

    const invokePrevCleanUps = (onMessage: onMessage<any>) => {
      const prevCleanUps = cleanFunctionMap.get(onMessage) || []
      prevCleanUps.forEach((cleanFn) => cleanFn())
      cleanFunctionMap.delete(onMessage)
    }

    const onCleanUp = (cleanFn: () => void) => {
      const cleanFns = cleanFunctionMap.get(onMessage) || []
      cleanFns.push(cleanFn)
      cleanFunctionMap.set(onMessage, cleanFns)
    }

    let promiseResolve: (value: any) => void

    returnValueMap.set(
      onMessage,
      new Promise((resolve) => {
        promiseResolve = resolve
      })
    )

    invokePrevCleanUps(onMessage)
    invoke(onMessage, { payload, onCleanUp, resolve: promiseResolve! })
    returnValueMap.get(onMessage)?.then((returnData) => {
      const encodedData = encode(returnData)
      globalThis.postMessage({ description, data: encodedData } as WorkerMessage)
    })
  })
}

// only need to regist once in the worker thread
initMessageReceiver()

export function registMessageReceiver<D = any>(description: WorkerDescription, onMessage: onMessage<D>) {
  callbackMap.set(description, onMessage)
}

tokenRegist()
tokenPriceRegist()
pairRegist()
farmRegist()
