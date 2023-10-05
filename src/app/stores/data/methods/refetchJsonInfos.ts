import { useDataStore } from '../store'
import { loadFarmJsonInfos } from '../actions/loadFarmJsonInfos'

export function refetchJsonInfos() {
  const store = useDataStore()
  loadFarmJsonInfos(store)
}
