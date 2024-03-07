import { toList, toMap } from "@edsolater/fnkit"
import { getConnection } from "../../../utils/dataStructures/Connection"
import { getTokenAccounts } from "../../../utils/dataStructures/TokenAccount"
import { PortUtils } from "../../../utils/webworker/createMessagePortTransforers"
import { composeClmmInfos } from "../utils/composeClmmInfo"
import { fetchClmmJsonInfo } from "../utils/fetchClmmJson"
import { sdkParseClmmInfos } from "../utils/sdkParseClmmInfos"

type QueryParams = { force?: boolean; rpcUrl: string; owner?: string }

export function workerLoadClmmInfos({ getMessagePort }: PortUtils) {
  const port = getMessagePort("fetch raydium clmm info")
  console.log("[worker] start loading clmm infos")
  port.receiveMessage((query: QueryParams) => {
    const apiClmmInfos = fetchClmmJsonInfo()

    apiClmmInfos
      .then(log("[worker] get apiClmmInfos"))
      .then((apiClmmInfos) => composeClmmInfos(apiClmmInfos))
      .then(port.postMessage)
      .catch(logError)

    const ownerInfo = query.owner ? getTokenAccounts({ owner: query.owner, connection: query.rpcUrl }) : undefined

    const sdkClmmInfos = Promise.all([apiClmmInfos, ownerInfo]).then(
      ([infos, ownerInfo]) =>
        infos &&
        sdkParseClmmInfos({
          connection: getConnection(query.rpcUrl),
          apiClmmInfos: toList(infos),
          ownerInfo:
            ownerInfo && query.owner
              ? {
                  owner: query.owner,
                  tokenAccounts: ownerInfo.sdkTokenAccounts,
                }
              : undefined,
        }),
    )

    Promise.all([apiClmmInfos, sdkClmmInfos])
      .then(log("[worker] start compose clmmInfos"))
      .then(([apiClmmInfos, sdkClmmInfos]) => composeClmmInfos(apiClmmInfos, sdkClmmInfos))
      .then((r) => port.postMessage(toMap(r)))
      .catch(logError)
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
