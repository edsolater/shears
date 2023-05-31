import { registMessageReceiver } from '../../../utils/webworker/worker_sdk'

export function txSwap_main() {
  throw new Error('not implemented')
  // return registMessageReceiver<CalculateSwapRouteInfosParams>(
  //   'txSwap start',
  //   async ({ payload, resolve, onClean }) => {
  //     const { abort, result, assertNotAborted } = calculateSwapRouteInfos(payload)
  //     result.then(
  //       inNextMainLoop((result) => {
  //         assertNotAborted()
  //         resolve(result)
  //       }),
  //     )
  //     onClean(abort)
  //   },
  // )
}
