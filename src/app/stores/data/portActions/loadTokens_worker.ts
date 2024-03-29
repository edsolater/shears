import { SOLToken } from '../../../utils/dataStructures/Token'
import { toCollectionObject } from '../../../../packages/fnkit/itemMethods'
import { PortUtils } from '../../../utils/webworker/createMessagePortTransforers'
import { StoreData } from '../store'
import { fetchTokenJsonFile } from '../utils/fetchTokenJson'

export function loadTokensInWorker(transformers: PortUtils) {
  const { receiver, sender } = transformers.getMessagePort('fetch raydium supported tokens')
  console.log('[👾worker  🚪port] registered load token')
  receiver.subscribe((options) => {
    console.log('[👾worker  🚧task] load tokens')
    /* TODO: currently only mainnet raydium token list was supported*/
    fetchTokenJsonFile(options)
      .then((res) => {
        console.log(res)
        const availableTokens = res?.tokens
          .filter((t) => !res?.blacklist.includes(t.mint) || t.name === 'Native Solana')
          .concat(SOLToken) // replace api mistakely add SOL
        return toCollectionObject(availableTokens, (t) => t.mint) satisfies StoreData['tokens']
      })
      .then(sender.post)
  })
}
