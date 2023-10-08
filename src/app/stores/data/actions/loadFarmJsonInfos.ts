import { createOnFirstAccess } from '../../../../packages/pivkit'
import { DataStore } from '../store'
import { loadFarmJsonInfos } from '../featureHooks/loadFarmJsonInfos'

export const onAccessFarmJsonInfos = createOnFirstAccess<DataStore>(['farmJsonInfos', 'farmInfos'], (store) => {
  loadFarmJsonInfos()
})
