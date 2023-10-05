import { deepUnwrapSolidProxy } from '../../../utils/txHandler/deepUnwrapSolidProxy'
import { subscribeWebWorker } from '../../../utils/webworker/mainThread_receiver'
import { TxSwapOptions } from './txSwap'

export function txSwap_main(txOptions: TxSwapOptions) {
  return subscribeWebWorker<any, any>('txSwap start', deepUnwrapSolidProxy(txOptions))
}
