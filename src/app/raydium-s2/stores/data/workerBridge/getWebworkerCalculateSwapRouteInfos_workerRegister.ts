import { registMessageReceiver } from '../../../utils/webworker/worker_sdk'
import { CalculateSwapRouteInfosParams, calculateSwapRouteInfos } from '../utils/calculateGetSwapInfos'

export function getWebworkerCalculateSwapRouteInfos_workerRegister() {
  return registMessageReceiver<CalculateSwapRouteInfosParams>(
    'get webworker calculate swap route infos',
    async ({ payload, resolve, onClean }) => {
      const count = performance.now()
      console.log(`start ${count}`)
      const { abort, result, hasAborted } = calculateSwapRouteInfos(payload)
      result.then((result) => {
        if (!hasAborted()) {
          console.log(`finish ${count}`)
          return resolve(result)
        }
      })
      onClean(() => {
        console.log(`abort ${count}`)
        abort()
      })
    }
  )
}
