import { toMap, toRecord } from "@edsolater/fnkit"
import { SOLToken } from "../token/utils"
import { type Token, type Tokens } from "../token/type"
import { PortUtils } from "../../../utils/webworker/createMessagePortTransforers"
import { fetchTokenJsonFile } from "../utils/fetchTokenJson"

export function loadTokensInWorker(transformers: PortUtils) {
  const { receiver, sender } = transformers.getMessagePort("fetch raydium supported tokens")
  console.log("[👾worker 🚪port] registered load token")
  receiver.subscribe((options) => {
    console.log("[👾worker 🚧task] load tokens")
    /* TODO: currently only mainnet raydium token list was supported*/
    fetchTokenJsonFile(options)
      .then((res) => {
        const availableTokens = res?.tokens
          .filter((t) => !res?.blacklist.includes(t.mint) || t.name === "Native Solana")
          .concat(SOLToken) // replace api mistakely add SOL
        return toMap(availableTokens, (t) => t.mint) as Tokens
      })
      .then(sender.post)
  })
}
