import { useFarmStore } from '../store'
import { loadFarmJsonInfos } from '../utils/queryFarmJsonInfos'

export function refetchJsonInfos() {
  const store = useFarmStore()
  loadFarmJsonInfos(store)
}
