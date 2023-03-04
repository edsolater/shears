import { jFetch } from '@edsolater/jfetch'
import { FarmPoolAprJsonInfo } from './type'

export async function fetchFarmAprJsonFile(options: {
  url: string
  owner?: string
}): Promise<FarmPoolAprJsonInfo[] | undefined> {
  const result = await jFetch<{ data: FarmPoolAprJsonInfo[] }>(options.url, { cacheFreshTime: 5 * 60 * 1000 })
  if (!result) return undefined
  return result.data
}
