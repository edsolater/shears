import { AnyFn } from '@edsolater/fnkit'
import { inNextMainLoop } from '../../../../packages/fnkit'
import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { CalculateSwapRouteInfosParams, calculateSwapRouteInfos } from '../utils/calculateSwapRouteInfos'

let storedCleanUpFunction: AnyFn | undefined = undefined

export function calculateSwapRouteInfosInWorker(transformers: MessagePortTransformers) {
  const messageSender = transformers.getMessageSender('let webworker calculate swap route infos')
  const messageReceiver = transformers.getMessageReceiver<CalculateSwapRouteInfosParams>(
    'let webworker calculate swap route infos',
  )
  messageReceiver.subscribe((payload) => {
    storedCleanUpFunction?.()
    const { abort, result, assertNotAborted } = calculateSwapRouteInfos(payload)
    result.then(
      inNextMainLoop((result) => {
        assertNotAborted()
        messageSender.query(result)
      }),
    )
    storedCleanUpFunction = abort
  })
}
