import { deepUnwrapSolidProxy } from '../../../utils/txHandler/deepUnwrapSolidProxy'
import { getMessageSender } from '../../../utils/webworker/loadWorker_main'
import { TxSwapOptions } from './txSwap'

export function txSwap_main(txOptions: TxSwapOptions) {
  return getMessageSender('txSwap start').query(deepUnwrapSolidProxy(txOptions))
}
