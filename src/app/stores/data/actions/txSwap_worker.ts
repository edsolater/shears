import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { TxSwapOptions, txSwap_getInnerTransaction } from '../utils/txSwap'

export function txSwap_worker(transformers: MessagePortTransformers) {
  const { receiver, sender } = transformers.getMessagePort<TxSwapOptions>('txSwap start')
  receiver.subscribe((txSwapOptions) => {
    console.log('receive tx swap option: ', txSwapOptions)
    const txSubscribable = txSwap_getInnerTransaction(txSwapOptions)

    console.log(
      'txSubscribable: ',
      txSubscribable.on('txSuccess', ({ txid }) => {
        console.log('success txid: ', txid)
        // send back txid to main thread
        sender.query({ txid })
      }),
    )
  })
}
