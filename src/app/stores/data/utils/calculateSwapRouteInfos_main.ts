import { isObject } from '@edsolater/fnkit'
import { openMessagePortToWorker } from '../../../utils/webworker/loadWorkerInMainThread'
import { CalculateSwapRouteInfosParams, CalculateSwapRouteInfosResult } from './calculateSwapRouteInfos'
import { deepUnwrapSolidProxy } from '../../../utils/txHandler/deepUnwrapSolidProxy'

export function calculatedSwapRouteInfos_main(params: CalculateSwapRouteInfosParams) {
  return openMessagePortToWorker<CalculateSwapRouteInfosResult, CalculateSwapRouteInfosParams>(
    'let webworker calculate swap route infos',
    deepUnwrapSolidProxy(params),
  )
}

// fnkit already has
export function isProxy(target: unknown): Record<string | number | symbol, any> {
  // @ts-ignore
  return isObject(target) && target instanceof Proxy
}
