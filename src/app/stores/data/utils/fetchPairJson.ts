import { jFetch } from '../../../../packages/jFetch'
import { appApiUrls } from '../../../utils/common/config'
import { PairJson } from '../types/pairs'

export async function fetchPairJsonInfo(): Promise<PairJson[] | undefined> {
  return jFetch<PairJson[]>(appApiUrls.pairs, {
    cacheFreshTime: 5 * 60 * 1000,
  })
}
