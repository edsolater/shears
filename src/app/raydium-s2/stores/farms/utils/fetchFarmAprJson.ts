import { jFetch } from '../../../../../packages/jFetch'
import { FarmAprJSONInfo } from '../type'

export async function fetchFarmAprJsonFile(options: {
  url: string
  owner?: string
}): Promise<FarmAprJSONInfo[] | undefined> {
  const result = await jFetch<{ data: FarmAprJSONInfo[] }>(options.url, { cacheFreshTime: 5 * 60 * 1000 })
  if (!result) return undefined
  return result.data
}
