import { useWalletStore } from '../../wallet/store'
import { useDataStore } from '../store'
import { loadFarmSYNInfos } from '../actions/queryFarmSYNInfos'

export function refetchFarmSYNInfos() {
  const walletStore = useWalletStore()
  const store = useDataStore()
  loadFarmSYNInfos({ owner: walletStore.owner, store })
}
