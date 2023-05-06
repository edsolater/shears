import { registMessageReceiver } from '../../../utils/webworker/worker_sdk'
import { CalculateSwapRouteInfosParams, calculateSwapRouteInfos } from '../utils/calculateGetSwapInfos'

export function getWebworkerCalculateSwapRouteInfos_workerRegister() {
  return registMessageReceiver<CalculateSwapRouteInfosParams>(
    'get webworker calculate swap route infos',
    async ({ payload, resolve, onClean }) => {
      calculateSwapRouteInfos(payload).then((result) => {
        console.log('result: ', result)
        return resolve(result)
      })
    }
  )
}
