import { jFetch } from '../../../../../packages/jFetch'
import { appApiUrls } from '../../../utils/common/config'
import { ApiAmmV3PoolsItem, ApiPoolInfo } from '../types/ammPools'

const apiCache = {} as {
  ammV3?: ApiAmmV3PoolsItem[]
  liquidity?: ApiPoolInfo
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
    fetchAmmV3PoolInfo().then((r) => {
      if (r) {
        apiCache.ammV3 = r
      }
    })
  }
  if (!apiCache.liquidity) {
    fetchOldAmmPoolInfo().then((r) => {
      if (r) {
        apiCache.liquidity = r
      }
    })
  }
  return apiCache
}
