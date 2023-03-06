import { assert, handleFnReturnValue } from '@edsolater/fnkit'
import { createGlobalStore, createStoreDefaultState } from '@edsolater/pivkit'
import toPubString from '../common/utils/pub'
import { connectWallet } from './connectWallet'
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
}

export const defaultWalletStore = createStoreDefaultState<WalletStore>((store) => ({
  $hasInited: false,
  connected: false,
  wallets: supportedWallets,
  connect: handleFnReturnValue(connectWallet, (r, [wallet]) =>
    r.then(() => {
      assert(wallet.adapter.publicKey, 'Wallet connected failed')
      store.setConnected(true)
      store.setOwner(toPubString(wallet.adapter.publicKey))
      store.setCurrentWallet(wallet)
    })
  )
}))

export const [useWalletStore, rawWalletStore, onWalletPropertyChange] = createGlobalStore<WalletStore>(
  defaultWalletStore,
  {
    onInit: [initWalletAccess] /* TODO: onStoreInit not onFirstAccess */
  }
)
