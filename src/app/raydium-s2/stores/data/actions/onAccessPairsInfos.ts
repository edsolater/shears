import { createOnFirstAccess } from '../../../../../packages/pivkit'
import { loadPairs } from './loadPairs'
import { DataStore } from '../store'

export const onAccessPairsInfos = createOnFirstAccess<DataStore>(['pairInfos'], (store) => {
  loadPairs(store)
})
