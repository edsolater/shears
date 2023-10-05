import { MayPromise } from '@edsolater/fnkit'
import { jFetch } from '../../../../packages/jFetch'
import { appApiUrls } from '../../../utils/common/config'
import { ApiAmmV3PoolsItem, ApiPoolInfo } from '../types/ammPools'

const apiCache = {} as {
  ammV3?: MayPromise<ApiAmmV3PoolsItem[] | undefined>
  liquidity?: MayPromise<ApiPoolInfo | undefined>
}

export function clearApiCache() {
  apiCache.ammV3 = undefined
  apiCache.liquidity = undefined
}

async function fetchAmmV3PoolInfo() {
  return jFetch<{ data: ApiAmmV3PoolsItem[] }>(appApiUrls.ammV3Pools).then((r) => r?.data) // note: previously Rudy has Test API for dev
}

async function fetchOldAmmPoolInfo() {
  return jFetch<ApiPoolInfo>(appApiUrls.poolInfo)
}

/**
 * api amm info
 */
export async function fetchAmmPoolInfo() {
  if (!apiCache.ammV3) {
    apiCache.ammV3 = fetchAmmV3PoolInfo()
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
