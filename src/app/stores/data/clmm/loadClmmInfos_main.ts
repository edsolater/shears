import { createTask } from "../../../../packages/conveyor/smartStore/task"
import { getMessagePort } from "../../../utils/webworker/loadWorker_main"
import { shuck_clmmInfos, shuck_isClmmJsonInfoLoading, shuck_owner, shuck_rpc } from "../store"
import type { ClmmInfos } from "../types/clmm"

export type ClmmQueryParams = {
  rpcUrl: string
  owner?: string
} & ClmmQueryCacheOptions

export type ClmmQueryCacheOptions = {
  /** @default true */
  shouldApi?: boolean

  /** @default true */
  shouldApiCache?: boolean

  /** @default true */
  shouldSDK?: boolean

  /** @default true */
  shouldSDKCache?: boolean

  /** @default true */
  shouldTokenAccountCache?: boolean
}

export function loadClmmInfos() {
  registerClmmInfosReceiver()
  const taskManager = createTask(
    [shuck_rpc, shuck_owner],
    () => {
      refreshClmmInfos()
    },
    { visiable: true },
  )
  return taskManager
}

/** can use this action isolatly */
export function refreshClmmInfos(options?: ClmmQueryCacheOptions) {
  const port = getMessagePort<ClmmInfos, ClmmQueryParams>("fetch raydium clmm info")
  const url = shuck_rpc()?.url
  const owner = shuck_owner()
  if (!url) return
  console.count("[🤖main clmm infos] start refreshing")
  shuck_isClmmJsonInfoLoading.set(true)
  port.postMessage({
    shouldApi: options?.shouldApi ?? true,
    shouldApiCache: options?.shouldApiCache ?? true,
    shouldSDK: options?.shouldSDK ?? true,
    shouldSDKCache: options?.shouldSDKCache ?? true,
    shouldTokenAccountCache: options?.shouldTokenAccountCache ?? true,
    rpcUrl: url,
    owner,
  })
}

export function registerClmmInfosReceiver() {
  const port = getMessagePort<ClmmInfos, ClmmQueryParams>("fetch raydium clmm info")
  console.log("[🤖main] register clmm infos receiver")
  port.receiveMessage(
    (infos) => {
      shuck_isClmmJsonInfoLoading.set(false)
      console.log("[🤖main] clmm infos: ", infos)
      shuck_clmmInfos.set(infos)
    },
    { key: "[🤖main] receive clmm infos" },
  )
}
