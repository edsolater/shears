import { toMap } from "@edsolater/fnkit"
import type { Mint } from "../../../utils/dataStructures/type"
import type { PortUtils } from "../../../utils/webworker/createMessagePortTransforers"
import { type Token, type Tokens } from "../token/type"
import { SOLToken } from "../token/utils"
import { fetchTokenJsonFile } from "../utils/fetchTokenJson"

export let tokensMap: Tokens = new Map<Mint, Token>()
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
        const tokens: Tokens = toMap(availableTokens, (t) => t.mint)
        tokensMap = tokens
        return tokens
      })
      .then(sender.post)
  })
}
