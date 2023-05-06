import { jFetch } from '../../../../../packages/jFetch'
import { asyncInvoke } from '../../../../../packages/pivkit/hooks/createContextStore/utils/asyncInvoke'
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
  const task1 = (async () => {
    if (!apiCache.ammV3) {
      apiCache.ammV3 = await fetchAmmV3PoolInfo()
    }
  })()
  const task2 = (async ()=>{
    if (!apiCache.liquidity) {
      apiCache.liquidity = await fetchOldAmmPoolInfo()
    }
  })()
  await Promise.allSettled([task1, task2])
  return apiCache
}
