import { jFetch } from '../../../../../packages/jFetch'
import { JsonPairItemInfo } from '../type'

// TODO: it should be a map
export async function fetchPairJsonInfo(options: { url: string }): Promise<Map<string, JsonPairItemInfo> | undefined> {
  const pairJsonInfo = await jFetch<JsonPairItemInfo[]>(options.url, {
    cacheFreshTime: 5 * 60 * 1000
  })
  console.log('pairJsonInfo: ', pairJsonInfo)
  if (!pairJsonInfo) return
  return new Map(pairJsonInfo.map((info) => [info.ammId, info] as const))
}
