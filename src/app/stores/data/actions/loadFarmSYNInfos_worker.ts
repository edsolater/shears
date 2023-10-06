import { registMessageReceiver } from '../../../utils/webworker/loadWorker_worker'
import type { CalculateSwapRouteInfosParams } from '../types/farm'
import { composeFarmSYN } from '../utils/composeFarmSYN'
import { createCleanUpFunctionBucket } from '../../../../packages/pivkit'
import type { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'

export function loadFarmSYNInfos_worker(transformers: MessagePortTransformers) {
  const storedCleanUpFunctions = createCleanUpFunctionBucket()
  registMessageReceiver<CalculateSwapRouteInfosParams>('get raydium farms syn infos', async ({ payload, resolve }) => {
    storedCleanUpFunctions.invokeStoredAndClear()
    const { abort, resultSubscribable } = composeFarmSYN(payload)
    resultSubscribable.subscribe(resolve)
    storedCleanUpFunctions.add(abort)
  })
}
