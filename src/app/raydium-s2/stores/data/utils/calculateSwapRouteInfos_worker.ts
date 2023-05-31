import { inNextMainLoop } from '../../../../../packages/fnkit/inNextMainLoop'
import { registMessageReceiver } from '../../../utils/webworker/worker_sdk'
import { CalculateSwapRouteInfosParams, calculateSwapRouteInfos } from './calculateSwapRouteInfos'

export function calculateSwapRouteInfos_worker() {
  return registMessageReceiver<CalculateSwapRouteInfosParams>(
    'let webworker calculate swap route infos',
    async ({ payload, resolve, onClean }) => {
      const { abort, result, assertNotAborted } = calculateSwapRouteInfos(payload)
      result.then(
        inNextMainLoop((result) => {
          assertNotAborted()
          resolve(result)
        }),
      )
      onClean(abort)
    },
  )
}
