import { toList } from '../../../../packages/pivkit/fnkit/itemMethods'
import { getConnection } from '../../../utils/common/getConnection'
import { PortUtils } from '../../../utils/webworker/createMessagePortTransforers'
import { workerCommands } from '../../../utils/webworker/type'
import { composeClmmInfos, composeOneClmmInfo } from '../utils/composeClmmInfo'
import { fetchClmmJsonInfo } from '../utils/fetchClmmJson'
import { sdkParseClmmInfos } from '../utils/sdkParseCLMMPoolInfo'

type QueryParams = { force?: boolean; rpcUrl: string }

export function workerLoadClmmInfos({ getMessagePort }: PortUtils) {
  const port = getMessagePort(workerCommands['fetch raydium clmm infos'])
  console.log('[worker] start loading clmm infos')
  port.receiveMessage((query: QueryParams) => {
    const apiClmmInfos = fetchClmmJsonInfo()

    apiClmmInfos
      .then(log('[worker] get apiClmmInfos'))
      .then((apiClmmInfos) => composeClmmInfos(apiClmmInfos))
      .then(port.postMessage)
      .catch(logError)
    // const sdkClmmInfos = apiClmmInfos.then(
    //   (infos) =>
    //     infos &&
    //     sdkParseClmmInfos({
    //       connection: getConnection(query.rpcUrl),
    //       apiClmmInfos: toList(infos),
    //     }),
    // )
    // Promise.all([apiClmmInfos, sdkClmmInfos])
    //   .then(log('[worker] start compose clmmInfos'))
    //   .then(([apiClmmInfos, sdkClmmInfos]) => composeClmmInfo(apiClmmInfos, sdkClmmInfos))
    //   .then(port.postMessage)
    //   .catch(logError)
  })
}

/**
 * a promise middleware
 * @param label log in first line
 * @returns a function to used in promise.then
 */
export function log(label?: string) {
  return (data: any) => {
    console.log(label, data)
    return data
  }
}

/**
 * a promise middleware
 * used for promise .catch
 */
export function logError(error?: unknown) {
  console.warn(error)
  return undefined
}
