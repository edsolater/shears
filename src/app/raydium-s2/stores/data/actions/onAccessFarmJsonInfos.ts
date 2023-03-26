import { createOnFirstAccess } from '../../../../../packages/pivkit'
import { loadFarmJsonInfos } from './queryFarmJsonInfos'
import { DataStore } from '../store'

export const onAccessFarmJsonInfos = createOnFirstAccess<DataStore>(['farmJsonInfos', 'farmInfos'], (store) => {
  loadFarmJsonInfos(store)
})
