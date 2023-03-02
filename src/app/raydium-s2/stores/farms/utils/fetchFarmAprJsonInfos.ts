import { jFetch } from '@edsolater/jfetch'
import { FarmPoolAprJsonInfo } from '../types/type'

export async function fetchFarmAprJsonInfos(options: {
  apiUrl: string
  owner?: string
}): Promise<FarmPoolAprJsonInfo[] | undefined> {
  const result = await jFetch<{ data: FarmPoolAprJsonInfo[] }>(options.apiUrl, { cacheFreshTime: 5 * 60 * 1000 })
  if (!result) return undefined
  return result.data
}
