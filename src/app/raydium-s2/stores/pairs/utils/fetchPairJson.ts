import { IndexAccessMap } from '../../../../../packages/fnkit/customizedClasses/IndexAccessMap'
import { jFetch } from '../../../../../packages/jFetch'
import { appApiUrls } from '../../../utils/common/config'
import { JsonPairItemInfo } from '../type'

// TODO: it should be a map
export async function fetchPairJsonInfo(): Promise<IndexAccessMap<JsonPairItemInfo, 'ammId'> | undefined> {
  const pairJsons = await jFetch<JsonPairItemInfo[]>(appApiUrls.pairs, {
    cacheFreshTime: 5 * 60 * 1000
  })
  console.log('pairJsonInfo: ', pairJsons)
  if (!pairJsons) return
  return new IndexAccessMap<JsonPairItemInfo, 'ammId'>('ammId', pairJsons)
}
