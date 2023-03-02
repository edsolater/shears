import { assert, isString } from '@edsolater/fnkit'
import { createStore } from 'solid-js/store'
import toPubString from '../common/utils/pub'
import { autoConnectWallet } from './utils/autoConnectWallet'
import { defaultWalletStore } from './configs/defaultWalletStore'
import { supportedWallets } from "./configs/supportedWallets"
import { WalletAdapterInterface, WalletsNames, WalletStore } from './types/type'

/**
 * solidjs store
 */
export function useWalletAdapter() {
  const [store, setStore] = createStore<WalletStore>(defaultWalletStore)
  autoConnectWallet({
    onLoadSuccess: ({ owner, adapterInterface }) => {
      setStore({ $hasInited: true, connected: true, owner, currentWallet: adapterInterface })
    },
    onBeforeInit: () => {
      setStore({ $hasInited: false })
    },
    onAfterInit: () => {
      setStore({ $hasInited: true })
    }
  })

  function connectWithStoreChange(wallet: WalletAdapterInterface | WalletsNames) {
    connectWallet(wallet, {
      onConnect: ({ adapterInterface }) => {
        assert(adapterInterface.adapter.publicKey, 'Wallet connected failed')
        setStore({
          connected: true,
          owner: toPubString(adapterInterface.adapter.publicKey),
          currentWallet: adapterInterface
        })
      }
    })
  }
  return {
    connected: () => store.connected,
    currentWallet: () => store.currentWallet,
    owner: () => store.owner,
    wallets: () => store.wallets,
    connect: connectWithStoreChange
  }
}

export function findWalletAdapter(name: string) {
  return supportedWallets.find((wallet) => wallet.adapter.name.toLowerCase() === name.toLowerCase())
}

export function connectWallet(
  wallet: WalletAdapterInterface | WalletsNames,
  cbs?: {
    onConnect?: (utils: { adapterInterface: WalletAdapterInterface }) => void
  }
) {
  const innerWallet = isString(wallet) ? findWalletAdapter(wallet) : wallet
  assert(innerWallet, 'Wallet not found')
  return innerWallet.adapter.connect().then((...r) => {
    cbs?.onConnect?.({ adapterInterface: innerWallet })
    return r
  })
}
