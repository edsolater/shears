import { IndexAccessMap } from '../../../../../packages/fnkit/customizedClasses/IndexAccessMap'
import { jFetch } from '../../../../../packages/jFetch'
import { appApiUrls } from '../../../utils/common/config'
import { PairJson } from '../type'

// TODO: it should be a map
export async function fetchPairJsonInfo(): Promise<IndexAccessMap<PairJson, 'ammId'> | undefined> {
  const pairJsons = await jFetch<PairJson[]>(appApiUrls.pairs, {
    cacheFreshTime: 5 * 60 * 1000
  })
  console.log('pairJsonInfo: ', pairJsons)
  if (!pairJsons) return
  return new IndexAccessMap<PairJson, 'ammId'>('ammId', pairJsons)
}
