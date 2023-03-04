import { jFetch } from '@edsolater/jfetch'
import { JsonPairItemInfo } from './type'

export async function fetchPairJsonInfo(options: { url: string }) {
  const pairJsonInfo = await jFetch<JsonPairItemInfo[]>(options.url, {
    cacheFreshTime: 5 * 60 * 1000
  })
  if (!pairJsonInfo) return
  return pairJsonInfo
}
