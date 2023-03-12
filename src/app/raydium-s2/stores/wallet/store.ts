import { createEffect, createMemo, createSignal, Setter } from 'solid-js'
import { createCachedGlobalHook } from '../../../../packages/pivkit'
import toPubString from '../../utils/common/pub'
import { Token } from '../tokenList/type'
import { WalletAdapterInterface } from './type'
import { connect } from './methods/connect'
import { disconnect } from './methods/disconnect'
import { initlyConnectPhantom } from './methods/initlyConnectPhantom'

export type WalletStore = {
  // for extract method
  $setters: {
    setHasInited: Setter<boolean>
    setConnected: Setter<boolean>
    setCurrentWallet: Setter<WalletAdapterInterface | undefined>
  }

  // data
  hasInited: boolean
  connected: boolean
  currentWallet?: WalletAdapterInterface
  owner?: string

  // methods
  connect(wallet: WalletAdapterInterface): Promise<void>
  disconnect(): Promise<void>
}

/**
 * token related type is in
 * {@link Token}
 */
export const useWalletStore = createCachedGlobalHook(() => {
  const [hasInited, setHasInited] = createSignal(false)
  const [connected, setConnected] = createSignal(false)
  const [currentWallet, setCurrentWallet] = createSignal<WalletAdapterInterface>()
  const owner = createMemo(() => toPubString(currentWallet()?.adapter.publicKey))
  createEffect(initlyConnectPhantom)
  const store: WalletStore = {
    $setters: {
      setHasInited,
      setConnected,
      setCurrentWallet
    },
    get hasInited() {
      return hasInited()
    },
    get connected() {
      return connected()
    },
    get currentWallet() {
      return currentWallet()
    },
    get owner() {
      return owner()
    },
    connect: connect,
    disconnect: disconnect
  }
  return store
})
