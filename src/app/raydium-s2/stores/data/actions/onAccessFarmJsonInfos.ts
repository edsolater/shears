import { createOnFirstAccess } from '../../../../../packages/pivkit'
import { loadFarmJsonInfos } from '../utils/queryFarmJsonInfos'
import { DataStore } from '../store'

export const onAccessFarmJsonInfos = createOnFirstAccess<DataStore>(['farmJsonInfos', 'farmInfos'], (store) => {
  loadFarmJsonInfos(store)
})
