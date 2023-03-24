import { IndexAccessList } from '../../../../../packages/fnkit/customizedClasses/IndexAccessList'
import { jFetch } from '../../../../../packages/jFetch'
import { appApiUrls } from '../../../utils/common/config'
import { PairJson } from '../type'

// TODO: it should be a map
export async function fetchPairJsonInfo(): Promise<IndexAccessList<PairJson, 'ammId'> | undefined> {
  const pairJsons = await jFetch<PairJson[]>(appApiUrls.pairs, {
    cacheFreshTime: 5 * 60 * 1000
  })
  if (!pairJsons) return
  return new IndexAccessList<PairJson, 'ammId'>(pairJsons, 'ammId')
}
