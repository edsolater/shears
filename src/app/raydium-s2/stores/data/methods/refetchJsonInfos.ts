import { useDataStore } from '../store'
import { loadFarmJsonInfos } from '../utils/queryFarmJsonInfos'

export function refetchJsonInfos() {
  const store = useDataStore()
  loadFarmJsonInfos(store)
}
