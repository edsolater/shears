import { listToMap, toList } from '@edsolater/fnkit'
import { Clmm as SDK_Clmm } from '@raydium-io/raydium-sdk'
import type { Connection } from '@solana/web3.js'
import toPubString, { toPub } from '../../../utils/dataStructures/Publickey'
import type { SDK_TokenAccount } from '../../../utils/dataStructures/TokenAccount'
import type { ClmmJsonInfo, ClmmSDKInfo } from '../types/clmm'

const sdkClmmInfoCache = new Map<string, ClmmSDKInfo>()

/**
 * pre-sdk-paresed amm info 2
 */
export async function sdkParseClmmInfos({
  connection,
  ownerInfo,
  apiClmmInfos: apiInfos,
  chainTimeOffset = 0,
}: {
  connection: Connection
  ownerInfo?: { owner: string; tokenAccounts: SDK_TokenAccount[] }
  apiClmmInfos: ClmmJsonInfo[] | Record<string, ClmmJsonInfo>
  chainTimeOffset?: number
}): Promise<Record<string, ClmmSDKInfo>> {
  const apiClmmInfos = toList(apiInfos)
  const needRefetchApiAmmPools = apiClmmInfos.filter(({ id }) => !sdkClmmInfoCache.has(toPubString(id)))
  if (needRefetchApiAmmPools.length) {
    const sdkParsed = await SDK_Clmm.fetchMultiplePoolInfos({
      poolKeys: needRefetchApiAmmPools,
      connection,
      batchRequest: true,
      chainTime: (Date.now() + chainTimeOffset) / 1000,
      ownerInfo: ownerInfo && {
        wallet: toPub(ownerInfo.owner),
        tokenAccounts: ownerInfo.tokenAccounts,
      },
    })
    for (const sdk of Object.values(sdkParsed)) {
      sdkClmmInfoCache.set(toPubString(sdk.state.id), sdk)
    }
  }

  const apiAmmPoolsArray = apiClmmInfos.map(({ id }) => sdkClmmInfoCache.get(toPubString(id))!)
  const clmmInfoMap = listToMap(apiAmmPoolsArray, (i) => toPubString(i.state.id))
  return clmmInfoMap
}
