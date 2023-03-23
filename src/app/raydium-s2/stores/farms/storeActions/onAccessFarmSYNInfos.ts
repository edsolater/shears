import { createEffect, getOwner, onCleanup } from 'solid-js'
import { createOnFirstAccess } from '../../../../../packages/pivkit'
import { useWalletStore } from '../../wallet/store'
import { loadFarmSYNInfos } from '../utils/queryFarmSYNInfos'
import { FarmStore } from '../store'

// 💡 subscribe wallet change
export const onAccessFarmSYNInfos = createOnFirstAccess<FarmStore>(['farmInfos'], (store) => {
  createEffect(() => {
    const walletStore = useWalletStore()
    const { abort } = loadFarmSYNInfos({ owner: walletStore.owner, store })
    onCleanup(() => {
      abort?.()
    })
  })
})
