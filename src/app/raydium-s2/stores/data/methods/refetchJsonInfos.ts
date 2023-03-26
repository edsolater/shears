import { useDataStore } from '../store'
import { loadFarmJsonInfos } from '../actions/queryFarmJsonInfos'

export function refetchJsonInfos() {
  const store = useDataStore()
  loadFarmJsonInfos(store)
}
