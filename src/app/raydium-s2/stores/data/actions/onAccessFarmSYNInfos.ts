import { createEffect, getOwner, onCleanup } from 'solid-js'
import { createOnFirstAccess } from '../../../../../packages/pivkit'
import { useWalletStore } from '../../wallet/store'
import { loadFarmSYNInfos } from './queryFarmSYNInfos'
import { DataStore } from '../store'

// 💡 subscribe wallet change
export const onAccessFarmSYNInfos = createOnFirstAccess<DataStore>(['farmInfos'], (store) => {
  createEffect(() => {
    const walletStore = useWalletStore()
    const { abort } = loadFarmSYNInfos({ owner: walletStore.owner, store })
    onCleanup(() => {
      abort?.()
    })
  })
})
