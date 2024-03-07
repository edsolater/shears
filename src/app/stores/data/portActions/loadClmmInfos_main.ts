import { createTask } from "../../../../packages/conveyor/smartStore/task"
import { getMessagePort } from "../../../utils/webworker/loadWorker_main"
import { shuck_clmmInfos, shuck_isClmmJsonInfoLoading, shuck_owner, shuck_rpc } from "../store"
import type { ClmmInfos } from "../types/clmm"

type LoadClmmQueryParams = { force?: boolean; rpcUrl: string; owner?: string }

export function loadClmmInfos() {
  const port = getMessagePort<ClmmInfos, LoadClmmQueryParams>("fetch raydium clmm info")
  createTask(
    [shuck_rpc, shuck_owner],
    () => {
      const url = shuck_rpc()?.url
      const owner = shuck_owner()
      if (!url) return
      console.log("owner: ", owner)
      console.log("[main] start loading clmm infos")
      shuck_isClmmJsonInfoLoading.set(true)
      port.postMessage({ force: false, rpcUrl: url, owner })
      port.receiveMessage((infos) => {
        console.log("[main] get clmm infos ", infos)
        shuck_isClmmJsonInfoLoading.set(false)
        shuck_clmmInfos.set(infos)
      })
    },
    { visiable: true },
  )
}
