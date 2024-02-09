import { SOLToken } from '../../../utils/dataStructures/Token'
import { toCollectionObject } from '../../../utils/dataTransmit/itemMethods'
import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { StoreData } from '../store'
import { fetchTokenJsonFile } from '../utils/fetchTokenJson'

export function loadTokens_worker(transformers: MessagePortTransformers) {
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
      .then(sender.query)
  })
}
