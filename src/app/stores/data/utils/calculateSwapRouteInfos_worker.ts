import { inNextMainLoop } from '../../../../packages/fnkit'
import { createCleanUpFunctionBucket } from '../../../../packages/pivkit'
import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { CalculateSwapRouteInfosParams, calculateSwapRouteInfos } from './calculateSwapRouteInfos'

const storedCleanUpFunctions = createCleanUpFunctionBucket()

export function calculateSwapRouteInfos_worker(options: MessagePortTransformers) {
  const sender = options.getMessageSender('let webworker calculate swap route infos')
  options.getMessageReceiver<CalculateSwapRouteInfosParams>('let webworker calculate swap route infos').subscribe((payload) => {
    storedCleanUpFunctions.invokeStoredAndClear()
    console.log('payload: ', payload)
    const { abort, result, assertNotAborted } = calculateSwapRouteInfos(payload)
    result.then(
      inNextMainLoop((result) => {
        assertNotAborted()
        sender.query(result)
      }),
    )
    storedCleanUpFunctions.add(abort)
  })
}
