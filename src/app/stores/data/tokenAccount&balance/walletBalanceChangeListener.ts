import { getConnection } from "../connection/getConnection"
import { toPub } from "../../../utils/dataStructures/Publickey"

export function addWalletBalanceChangeListener(options: {
  owner: string
  rpcUrl: string
  onChange(): void
  /** @default "confirmed" */
  commitment?: "confirmed" | "finalized"
}): { listenerId: number; cancel(): void } | undefined {
  const connection = getConnection(options.rpcUrl)
  const owner = options.owner
  if (!connection || !owner) return
  const listenerId = connection.onAccountChange(
    toPub(owner),
    () => {
      options.onChange()
    },
    "confirmed",
  )
  return {
    listenerId,
    cancel() {
      connection.removeAccountChangeListener(listenerId)
    },
  }
}

export function removeWalletBalanceChangeListener({ listenerId, rpcUrl }: { listenerId: number; rpcUrl: string }) {
  const connection = getConnection(rpcUrl)
  connection.removeAccountChangeListener(listenerId)
}
