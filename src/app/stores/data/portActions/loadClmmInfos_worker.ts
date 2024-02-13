import { toList } from '../../../../packages/pivkit/fnkit/itemMethods'
import { getConnection } from '../../../utils/common/getConnection'
import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { workerCommands } from '../../../utils/webworker/type'
import { fetchClmmJsonInfo } from '../utils/fetchClmmJson'
import { sdkParseClmmInfos } from '../utils/sdkParseCLMMPoolInfo'

type QueryParams = { force?: boolean; rpcUrl: string }

export function workerLoadClmmInfos({ getMessagePort }: MessagePortTransformers) {
  const port = getMessagePort(workerCommands['fetch raydium clmm infos'])
  console.log('[worker] start loading clmm infos')
  port.receiver.subscribe((query: QueryParams) => {
    console.log('query: ', query)
    try {
      const apiClmmInfos = fetchClmmJsonInfo()
    } catch (e) {
      console.log('error: ', e)
    }
    console.log('44: ', 44)
    // apiClmmInfos.then(log('apiClmmInfos')).then(port.sender.query)

    // const sdkClmmInfos = apiClmmInfos.then(
    //   (infos) =>
    //     infos &&
    //     sdkParseClmmInfos({
    //       connection: getConnection(query.rpcUrl),
    //       apiClmmInfos: toList(infos),
    //     }),
    // )
  })
}

/**
 * a middleware
 * @param label log in first line
 * @returns a function to used in promise.then
 */
export function log(label?: string) {
  return (data: any) => {
    console.log(label, data)
    return data
  }
}
