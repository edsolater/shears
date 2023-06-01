import { registMessageReceiver } from '../../../utils/webworker/worker_sdk'
import { TxSwapOptions, txSwap_getInnerTransaction } from './txSwap'

export function txSwap_worker() {
  return registMessageReceiver<TxSwapOptions>('txSwap start', async ({ payload: txOptions, resolve, onClean }) => {
    const txSubscribable = txSwap_getInnerTransaction(txOptions)
    console.log(
      'txSubscribable: ',
      txSubscribable.onTxSuccess(({ txid }) => {
        console.log('txid: ', txid)
      }),
    )
  })
}
