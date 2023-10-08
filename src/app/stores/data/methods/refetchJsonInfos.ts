import { useDataStore } from '../store'
import { loadFarmJsonInfos } from '../featureHooks/loadFarmJsonInfos'

export function refetchJsonInfos() {
  const store = useDataStore()
  loadFarmJsonInfos(store)
}
