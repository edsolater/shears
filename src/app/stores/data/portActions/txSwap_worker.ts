import { PortUtils } from '../../../utils/webworker/createMessagePortTransforers'
import { TxSwapOptions, txSwap_getInnerTransaction } from '../utils/txSwap'

export function txSwapInWorker(transformers: PortUtils<TxSwapOptions>) {
  const { receiver, sender } = transformers.getMessagePort('txSwap start')
  receiver.subscribe((txSwapOptions) => {
    console.log('receive tx swap option: ', txSwapOptions)
    const txSubscribable = txSwap_getInnerTransaction(txSwapOptions)

    console.log(
      'txSubscribable: ',
      txSubscribable.on('txSuccess', ({ txid }) => {
        console.log('success txid: ', txid)
        // send back txid to main thread
        sender.post({ txid })
      }),
    )
  })
}
