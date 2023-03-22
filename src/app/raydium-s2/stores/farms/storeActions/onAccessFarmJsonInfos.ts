import { createOnFirstAccess } from '../../../../../packages/pivkit'
import { loadFarmJsonInfos } from '../utils/queryFarmJsonInfos'
import { FarmStore } from '../store'

export const onAccessFarmJsonInfos = createOnFirstAccess<FarmStore>(['farmJsonInfos', 'farmInfos'], (store) => {
  loadFarmJsonInfos(store)
})
