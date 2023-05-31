import { isObject, isObjectLiteral, map } from '@edsolater/fnkit'
import { unwrap } from 'solid-js/store'
import { subscribeWebWorker } from '../../../utils/webworker/mainThread_receiver'
import { CalculateSwapRouteInfosParams, CalculateSwapRouteInfosResult } from './calculateSwapRouteInfos'

export function calculatedSwapRouteInfos_main(params: CalculateSwapRouteInfosParams) {
  return subscribeWebWorker<CalculateSwapRouteInfosResult, CalculateSwapRouteInfosParams>(
    'let webworker calculate swap route infos',
    deepUnwrapSolidProxy(params),
  )
}

/** solidjs utils */
function deepUnwrapSolidProxy<T>(data: T): T {
  if (isObjectLiteral(data)) {
    return map(data, (v) => deepUnwrapSolidProxy(v)) as T
  } else if (isProxy(data)) {
    return unwrap(data)
  } else {
    return data
  }
}

// fnkit already has
function isProxy(target: unknown): Record<string | number | symbol, any> {
  // @ts-ignore
  return isObject(target) && target instanceof Proxy
}
