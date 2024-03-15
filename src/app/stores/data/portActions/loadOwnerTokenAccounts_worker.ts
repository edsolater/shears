import { getTokenAccounts } from "../../../utils/dataStructures/TokenAccount"
import { PortUtils } from "../../../utils/webworker/createMessagePortTransforers"
import type { FetchTokenAccountsQueryParams, TokenAccounts } from "./loadOwnerTokenAccounts_main"

export function loadOwnerTokenAccountsInWorker({
  getMessagePort,
}: PortUtils<FetchTokenAccountsQueryParams, TokenAccounts>) {
  const port = getMessagePort("fetch owner token accounts")
  console.log("[WORKER owner token accounts] start")
  port.receiveMessage((query) => {
    const tokenAccountsPromise = query.owner
      ? getTokenAccounts({ owner: query.owner, connection: query.rpcUrl })
      : undefined
    tokenAccountsPromise?.then(({ tokenAccounts }) => {
      port.postMessage(tokenAccounts)
    })
  })
}
