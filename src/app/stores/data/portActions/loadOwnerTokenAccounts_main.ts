import { add, toIterable, type Collection, type Numberish } from "@edsolater/fnkit"
import { createTask } from "../../../../packages/conveyor/smartStore/task"
import type { TokenAccount } from "../../../utils/dataStructures/TokenAccount"
import type { Mint } from "../../../utils/dataStructures/type"
import { getMessagePort } from "../../../utils/webworker/loadWorker_main"
import { shuck_balances, shuck_isTokenAccountsLoading, shuck_owner, shuck_rpc, shuck_tokenAccounts } from "../store"

export type FetchTokenAccountsQueryParams = { rpcUrl: string; owner: string }
export type TokenAccounts = Collection<TokenAccount>

export function loadOwnerTokenAccounts() {
  const port = getMessagePort<TokenAccounts, FetchTokenAccountsQueryParams>("fetch owner token accounts")
  const taskManager = createTask(
    [shuck_rpc, shuck_owner],
    () => {
      const owner = shuck_owner()
      const rpcUrl = shuck_rpc()?.url // TODO  shuck should have `.pip()`
      if (!owner) {
        // console.log("wallet haven't connect yet, skip loading token account infos.")
        return
      }
      if (!rpcUrl) {
        // console.log("rpc url is not available, skip loading token account infos.")
        return
      }

      console.count("[main owner token accounts] start")
      shuck_isTokenAccountsLoading.set(true)
      port.postMessage({ owner, rpcUrl: rpcUrl })
      port.receiveMessage((tokenAccounts) => {
        console.log("[main] get token accounts ", tokenAccounts)
        shuck_isTokenAccountsLoading.set(false)
        shuck_tokenAccounts.set(tokenAccounts)
        const balances: Record<Mint, Numberish> = {}
        for (const tokenAccount of toIterable(tokenAccounts)) {
          const mint = tokenAccount.mint
          if (balances[mint]) {
            balances[mint] = add(balances[mint], tokenAccount.amount)
          } else {
            balances[mint] = tokenAccount.amount
          }
        }
        shuck_balances.set(balances)
      })
    },
    { visiable: true },
  )
  return taskManager
}
