import { toList } from '../../../../packages/pivkit/fnkit/itemMethods'
import { getConnection } from '../../../utils/common/getConnection'
import { MessagePortTransformers } from '../../../utils/webworker/createMessagePortTransforers'
import { workerCommands } from '../../../utils/webworker/type'
import { fetchClmmJsonInfo } from '../utils/fetchClmmJson'
import { sdkParseClmmInfos } from '../utils/sdkParseCLMMPoolInfo'

type QueryParams = { force?: boolean; rpcUrl: string }

export function workerLoadClmmInfos({ getMessagePort }: MessagePortTransformers) {
  const port = getMessagePort(workerCommands['fetch raydium Clmm info'])
  console.log('[worker] start loading Clmm infos')
  port.receiver.subscribe((query: QueryParams) => {
    const apiClmmInfos = fetchClmmJsonInfo()
    apiClmmInfos.then(port.sender.query)

    const sdkClmmInfos = apiClmmInfos.then(
      (infos) =>
        infos &&
        sdkParseClmmInfos({
          connection: getConnection(query.rpcUrl),
          apiClmmInfos: toList(infos),
        }),
    )
    sdkClmmInfos.then((i) => console.log('sdk i: ', i))
  })
}
