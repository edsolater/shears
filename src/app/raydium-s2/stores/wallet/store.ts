import { assert } from '@edsolater/fnkit'
import { createGlobalStore, createStoreDefaultState } from '@edsolater/pivkit'
import toPubString from '../common/utils/pub'
import { connectWallet } from './connectWallet'
import { disconnectWallet } from './disconnectWallet'
import { initWalletAccess } from './initWalletAccess'
import { supportedWallets } from './supportedWallets'
import { WalletAdapterInterface } from './type'

export type WalletStore = {
  $hasInited: boolean
  connected: boolean
  currentWallet?: WalletAdapterInterface
  wallets: WalletAdapterInterface[]
  owner?: string
  connect(wallet: WalletAdapterInterface): Promise<void>
  disconnect(): Promise<void>
}

export const defaultWalletStore = createStoreDefaultState<WalletStore>((store) => ({
  $hasInited: false,
  connected: false,
  wallets: supportedWallets,
  connect: (wallet: WalletAdapterInterface) =>
    connectWallet(wallet).then(() => {
      assert(wallet.adapter.publicKey, 'Wallet connected failed')
      store.setConnected(true)
      store.setOwner(toPubString(wallet.adapter.publicKey))
      store.setCurrentWallet(wallet)
    }),
  disconnect: () =>
    store.currentWallet
      ? disconnectWallet(store.currentWallet).then(() => {
          store.setConnected(false)
          store.setOwner(undefined)
          store.setCurrentWallet(undefined)
        })
      : Promise.resolve()
}))

export const [useWalletStore, rawWalletStore, onWalletPropertyChange] = createGlobalStore<WalletStore>(
  defaultWalletStore,
  {
    onInit: [initWalletAccess] /* TODO: onStoreInit not onFirstAccess */
  }
)
