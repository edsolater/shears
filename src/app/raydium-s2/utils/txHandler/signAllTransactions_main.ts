import { sdkworker } from '../webworker/mainThread_receiver'
import { getMessageReceiver } from '../webworker/getMessageReceiver'
import { getMessageSender } from '../webworker/getMessageSender'

export function signAllTransactionReceiver() {
  const receiver = getMessageReceiver(sdkworker, 'sign transaction in main thread')
  const sender = getMessageSender(sdkworker, 'sign transaction in main thread')
  receiver.subscribe((transactions) => {
    console.log('receiver form mainThread transactions: ', transactions)
  })
}
