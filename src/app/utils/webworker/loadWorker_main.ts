import { createSignTransactionPortInMainThread } from '../txHandler/signAllTransactions_main'
import { createMessagePortTransforers } from './createMessagePortTransforers'

export const sdkworker = import('./loadWorker_worker?worker').then((module) => new module.default())
export const { getMessageReceiver, getMessageSender, getMessagePort } = createMessagePortTransforers(sdkworker)
console.log('sdkworker: ', sdkworker)
createSignTransactionPortInMainThread()
