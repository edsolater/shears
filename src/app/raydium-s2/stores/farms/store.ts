import { onCleanup } from 'solid-js'
import { createGlobalStore, createOnFirstAccessCallback, createStoreDefaultState } from '../../../../packages/pivkit'
import { useWalletStore } from '../wallet/store'
import { loadFarmJsonInfos } from './methods/loadFarmJsonInfos'
import { loadFarmSYNInfos } from './methods/loadFarmSYNInfos'
import { FarmJSON, FarmSYNInfo } from './type'

export type FarmStore = {
  readonly farmJsonInfos: Map<FarmJSON['id'], FarmJSON> | undefined
  readonly isFarmJsonLoading: boolean
  readonly farmInfos: Map<FarmSYNInfo['id'], FarmSYNInfo> | undefined
  readonly isFarmInfosLoading: boolean
  refetchJsonInfos(): void
  refetchFarmSYNInfos(): void
}

const defaultFarmStore = createStoreDefaultState<FarmStore>((store) => ({
  isFarmJsonLoading: false,
  isFarmInfosLoading: false,
  refetchJsonInfos: () => loadFarmJsonInfos(store),
  refetchFarmSYNInfos() {
    const walletStore = useWalletStore()
    loadFarmSYNInfos({ owner: walletStore.owner, store })
  }
}))

const onAccessFarmJsonInfos = createOnFirstAccessCallback<FarmStore>(['farmJsonInfos', 'farmInfos'], (store) => {
  loadFarmJsonInfos(store)
})

const onAccessFarmSYNInfos = createOnFirstAccessCallback<FarmStore>(['farmInfos'], (store) => {
  const walletStore = useWalletStore()
  console.log('TODO: it\'s not subscribe wallet owner: ', walletStore.owner)
  const { abort } = loadFarmSYNInfos({ owner: walletStore.owner, store })
  onCleanup(() => {
    abort?.()
  })
})

export const [useFarmStore] = createGlobalStore<FarmStore>(defaultFarmStore, {
  onFirstAccess: [onAccessFarmJsonInfos, onAccessFarmSYNInfos]
})
