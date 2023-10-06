import { isObject } from '@edsolater/fnkit'
import { deepUnwrapSolidProxy } from '../../../utils/txHandler/deepUnwrapSolidProxy'
import { CalculateSwapRouteInfosParams } from './calculateSwapRouteInfos'
import { getMessageSender } from '../../../utils/webworker/loadWorker_main'

export function calculatedSwapRouteInfos_main(params: CalculateSwapRouteInfosParams) {
  return getMessageSender('let webworker calculate swap route infos').query(deepUnwrapSolidProxy(params))
}

// fnkit already has
export function isProxy(target: unknown): Record<string | number | symbol, any> {
  // @ts-ignore
  return isObject(target) && target instanceof Proxy
}
