import { onCleanup } from 'solid-js'
import { createOnFirstAccess } from '../../../../../packages/pivkit'
import { useWalletStore } from '../../wallet/store'
import { loadFarmSYNInfos } from '../utils/queryFarmSYNInfos'
import { FarmStore } from '../store'

// 💡 subscribe wallet change
export const onAccessFarmSYNInfos = createOnFirstAccess<FarmStore>(['farmInfos'], (store) => {
  const walletStore = useWalletStore()
  console.log("TODO: it's not subscribe wallet owner: ", walletStore.owner)
  const { abort } = loadFarmSYNInfos({ owner: walletStore.owner, store })
  onCleanup(() => {
    abort?.()
  })
})
