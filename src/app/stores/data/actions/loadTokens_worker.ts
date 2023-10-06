import { SOLToken } from '../../../utils/dataStructures/Token'
import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { fetchTokenJsonFile } from '../utils/fetchTokenJson'

export function loadTokens_worker(transformers: MessagePortTransformers) {
  const { receiver, sender } = transformers.getMessagePort('fetch raydium supported tokens')
  console.log('loadTokens_worker')
  receiver.subscribe((options) => {
    /* TODO: currently only mainnet raydium token list was supported*/
    fetchTokenJsonFile(options)
      .then((res) => {
        const availableTokens = res?.tokens
          .filter((t) => !res?.blacklist.includes(t.mint) || t.name === 'Native Solana')
          .concat(SOLToken) // replace api mistakely add SOL
        return availableTokens ?? []
      })
      .then(sender.query)
  })
}
