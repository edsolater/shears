import { toCollectionObject } from '../../../../packages/fnkit/itemMethods'
import { SOLToken, type Token } from '../../../utils/dataStructures/Token'
import { PortUtils } from '../../../utils/webworker/createMessagePortTransforers'
import { fetchTokenJsonFile } from '../utils/fetchTokenJson'

export function loadTokensInWorker(transformers: PortUtils) {
  const { receiver, sender } = transformers.getMessagePort('fetch raydium supported tokens')
  console.log('[👾worker 🚪port] registered load token')
  receiver.subscribe((options) => {
    console.log('[👾worker 🚧task] load tokens')
    /* TODO: currently only mainnet raydium token list was supported*/
    fetchTokenJsonFile(options)
      .then((res) => {
        const availableTokens = res?.tokens
          .filter((t) => !res?.blacklist.includes(t.mint) || t.name === 'Native Solana')
          .concat(SOLToken) // replace api mistakely add SOL
        return toCollectionObject(availableTokens, (t) => t.mint) satisfies Record<string, Token>
      })
      .then(sender.post)
  })
}
