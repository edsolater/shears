import { deepUnwrapSolidProxy } from '../../../utils/txHandler/deepUnwrapSolidProxy'
import { openMessagePortToWorker } from '../../../utils/webworker/loadWorkerFromMainThread'
import { TxSwapOptions } from './txSwap'

export function txSwap_main(txOptions: TxSwapOptions) {
  return openMessagePortToWorker<any, any>('txSwap start', deepUnwrapSolidProxy(txOptions))
}
