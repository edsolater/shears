import { inNextMainLoop } from '../../../../packages/fnkit'
import { registMessageReceiver } from '../../../utils/webworker/loadSDKWorker'
import { CalculateSwapRouteInfosParams, calculateSwapRouteInfos } from './calculateSwapRouteInfos'
import { createCleanUpFunctionBucket } from '../../../../packages/pivkit'

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
