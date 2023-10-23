import { SOLToken } from '../../../utils/dataStructures/Token'
import { toRecord } from '../../../utils/dataTransmit/getItems'
import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { workerCommands } from '../../../utils/webworker/type'
import { StoreData } from '../store'
import { fetchTokenJsonFile } from '../utils/fetchTokenJson'

export function loadTokens_worker(transformers: MessagePortTransformers) {
  const { receiver, sender } = transformers.getMessagePort(workerCommands['fetch raydium supported tokens'])
  console.log('loadTokens_worker')
  receiver.subscribe((options) => {
    /* TODO: currently only mainnet raydium token list was supported*/
    fetchTokenJsonFile(options)
      .then((res) => {
        const availableTokens = res?.tokens
          .filter((t) => !res?.blacklist.includes(t.mint) || t.name === 'Native Solana')
          .concat(SOLToken) // replace api mistakely add SOL
        return toRecord(availableTokens, (t) => t.mint) satisfies StoreData['tokens']
      })
      .then(sender.query)
  })
}
