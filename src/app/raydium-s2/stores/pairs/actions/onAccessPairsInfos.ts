import { createOnFirstAccess } from '../../../../../packages/pivkit'
import { queryPairs } from '../utils/queryPairs'
import { PairsStore } from '../store'

export const onAccessPairsInfos = createOnFirstAccess<PairsStore>(['infos'], (store) => {
  queryPairs(store)
})
