import { MayPromise } from '@edsolater/fnkit'
import { jFetch } from '../../../../packages/jFetch'
import { appApiUrls } from '../../../utils/common/config'
import type { ApiPoolInfo } from '../types/ammPools'
import type { APIClmmInfo } from '../types/clmm'

const apiCache = {} as {
  Clmm?: MayPromise<APIClmmInfo[] | undefined>
  liquidity?: MayPromise<ApiPoolInfo | undefined>
}

export function clearApiCache() {
  apiCache.Clmm = undefined
  apiCache.liquidity = undefined
}

async function fetchClmmPoolInfo() {
  return jFetch<{ data: APIClmmInfo[] }>(appApiUrls.clmmPools).then((r) => r?.data) // note: previously Rudy has Test API for dev
}

async function fetchOldAmmPoolInfo() {
  return jFetch<ApiPoolInfo>(appApiUrls.poolInfo)
}

/**
 * api amm info
 */
export async function fetchAmmPoolInfo() {
  if (!apiCache.Clmm) {
    apiCache.Clmm = fetchClmmPoolInfo()
  }
  if (!apiCache.liquidity) {
    apiCache.liquidity = fetchOldAmmPoolInfo()
  }
  return apiCache
}

export function prefetch() {
  console.info('[prefetch] start prefetch ammPoolInfo')
  return fetchAmmPoolInfo()
}

// apply prefetch (ammPoolInfo)
prefetch()
