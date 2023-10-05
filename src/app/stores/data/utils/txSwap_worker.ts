import { registMessageReceiver } from '../../../utils/webworker/worker_sdk'
import { TxSwapOptions, txSwap_getInnerTransaction } from './txSwap'

export function txSwap_worker() {
  return registMessageReceiver<TxSwapOptions>('txSwap start', async ({ payload: txSwapOptions }) => {
    console.log('receive tx swap option: ', txSwapOptions)
    const txSubscribable = txSwap_getInnerTransaction(txSwapOptions)

    console.log(
      'txSubscribable: ',
      txSubscribable.on('txSuccess', ({ txid }) => {
        console.log('success txid: ', txid)
      }),
    )
  })
}
