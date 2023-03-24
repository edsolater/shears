import { useWalletStore } from '../../wallet/store'
import { useFarmStore } from '../store'
import { loadFarmSYNInfos } from '../utils/queryFarmSYNInfos'

export function refetchFarmSYNInfos() {
  const walletStore = useWalletStore()
  const store = useFarmStore()
  loadFarmSYNInfos({ owner: walletStore.owner, store })
}
