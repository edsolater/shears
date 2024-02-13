import { AnyFn } from '@edsolater/fnkit'
import { inNextMainLoop } from '../../../../packages/fnkit'
import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import {
  CalculateSwapRouteInfosParams,
  calculateSwapRouteInfos,
  type CalculateSwapRouteInfosResult,
} from '../utils/calculateSwapRouteInfos'

let storedCleanUpFunction: AnyFn | undefined = undefined

export function calculateSwapRouteInfosInWorker({
  getMessagePort,
}: MessagePortTransformers<CalculateSwapRouteInfosParams, CalculateSwapRouteInfosResult>) {
  const port = getMessagePort('let webworker calculate swap route infos')
  port.receiver.subscribe((payload) => {
    storedCleanUpFunction?.()
    const { abort, result, assertNotAborted } = calculateSwapRouteInfos(payload)
    result.then(
      inNextMainLoop((result) => {
        assertNotAborted()
        port.sender.post(result)
      }),
    )
    storedCleanUpFunction = abort
  })
}
