import { createOnFirstAccess } from '../../../../../packages/pivkit'
import { queryPairs } from '../utils/queryPairs'
import { DataStore } from '../store'

export const onAccessPairsInfos = createOnFirstAccess<DataStore>(['pairInfos'], (store) => {
  queryPairs(store)
})
