import { inNextMainLoop } from '../../../../../packages/fnkit/inNextMainLoop'
import { registMessageReceiver } from '../../../utils/webworker/worker_sdk'
import { CalculateSwapRouteInfosParams, calculateSwapRouteInfos } from './calculateSwapRouteInfos'
import { createCleanUpFunctionBucket } from '../../../../../packages/pivkit/utils/createCleanUpFunctionBucket'

const storedCleanUpFunctions = createCleanUpFunctionBucket()

export function calculateSwapRouteInfos_worker() {
  return registMessageReceiver<CalculateSwapRouteInfosParams>(
    'let webworker calculate swap route infos',
    async ({ payload, resolve }) => {
      storedCleanUpFunctions.invokeStoredAndClear()
      console.log('payload: ', payload)
      const { abort, result, assertNotAborted } = calculateSwapRouteInfos(payload)
      result.then(
        inNextMainLoop((result) => {
          assertNotAborted()
          resolve(result)
        }),
      )
      storedCleanUpFunctions.add(abort)
    },
  )
}
