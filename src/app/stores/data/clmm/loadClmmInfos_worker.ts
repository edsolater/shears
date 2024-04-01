import { toList } from "@edsolater/fnkit"
import { getTokenAccounts } from "../../../utils/dataStructures/TokenAccount"
import { PortUtils } from "../../../utils/webworker/createMessagePortTransforers"
import { getConnection } from "../connection/getConnection"
import { workerThreadWalletInfo } from "../store_worker"
import { sdkParseClmmInfos } from "../utils/sdkParseClmmInfos"
import { composeClmmInfos } from "./composeClmmInfo"
import { fetchClmmJsonInfo } from "./fetchClmmJson"
import type { ClmmQueryParams, ClmmTransferPayload } from "./loadClmmInfos_main"
import { reportLog } from "../utils/logger"

export function loadClmmInfosInWorker({ getMessagePort }: PortUtils<ClmmQueryParams, ClmmTransferPayload>) {
  reportLog("[⚙️worker] start loading clmm infos")
  const port = getMessagePort("fetch raydium clmm info")
  port.receiveMessage(
    ({ owner, rpcUrl, shouldApi, shouldApiCache, shouldSDK, shouldSDKCache, shouldTokenAccountCache }) => {
      workerThreadWalletInfo.owner = owner
      workerThreadWalletInfo.rpcUrl = rpcUrl
      const ownerTokenAccounts = owner
        ? getTokenAccounts({ canUseCache: shouldTokenAccountCache, owner: owner, connection: rpcUrl })
        : undefined

      const apiClmmInfos = fetchClmmJsonInfo(shouldApiCache)

      if (shouldApi) {
        apiClmmInfos
          .then(log("[⚙️worker] clmm API Infos"))
          .then((apiClmmInfos) => composeClmmInfos(apiClmmInfos))
          .then((infos) => port.postMessage({ list: infos, has: ["API"] }))
          .catch(logError)
      }

      if (shouldSDK) {
        const sdkClmmInfos = Promise.all([apiClmmInfos, ownerTokenAccounts]).then(
          ([infos, ownerInfo]) =>
            infos &&
            sdkParseClmmInfos({
              shouldUseCache: shouldSDKCache,
              connection: getConnection(rpcUrl),
              apiClmmInfos: toList(infos),
              ownerInfo:
                ownerInfo && owner
                  ? {
                      owner: owner,
                      tokenAccounts: ownerInfo.sdkTokenAccounts,
                    }
                  : undefined,
            }),
        )

        Promise.all([apiClmmInfos, sdkClmmInfos])
          .then(log("[⚙️worker] start compose clmmInfos"))
          .then(([apiClmmInfos, sdkClmmInfos]) => composeClmmInfos(apiClmmInfos, sdkClmmInfos))
          .then((infos) => port.postMessage({ list: infos, has: ["API", "SDK"] }))
          .catch(logError)
      }
    },
  )
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
