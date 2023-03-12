import { assert } from '@edsolater/fnkit'
import { createEffect, createMemo, createSignal } from 'solid-js'
import { createCachedGlobalHook } from '../../../../packages/pivkit'
import toPubString from '../../utils/common/pub'
import { Token } from '../tokenList/type'
import { autoConnectWallet } from './autoConnectWallet'
import { connectWallet } from './connectWallet'
import { disconnectWallet } from './disconnectWallet'
import { WalletAdapterInterface } from './type'

export type WalletStore = {
  $hasInited: boolean
  connected: boolean
  currentWallet?: WalletAdapterInterface
  owner?: string
  connect(wallet: WalletAdapterInterface): Promise<void>
  disconnect(): Promise<void>
}

/**
 * token related type is in
 * {@link Token}
 */

export const useWalletStore = createCachedGlobalHook(() => {
  const [$hasInited, set$hasInited] = createSignal(false)
  const [connected, setConnected] = createSignal(false)
  const [currentWallet, setCurrentWallet] = createSignal<WalletAdapterInterface>()
  const owner = createMemo(() => toPubString(currentWallet()?.adapter.publicKey ?? undefined) || undefined)

  createEffect(() => {
    autoConnectWallet({
      onLoadSuccess: ({ adapterInterface }) => {
        set$hasInited(true)
        setConnected(true)
        setCurrentWallet(adapterInterface)
      },
      onBeforeInit: () => {
        set$hasInited(false)
      },
      onAfterInit: () => {
        set$hasInited(true)
      }
    })
  })

  async function connect(wallet: WalletAdapterInterface) {
    return connectWallet(wallet).then(() => {
      assert(wallet.adapter.publicKey, 'Wallet connected failed')
      setConnected(true)
      setCurrentWallet(wallet)
    })
  }

  async function disconnect() {
    return currentWallet()
      ? disconnectWallet(currentWallet()!).then(() => {
          setConnected(false)
          setCurrentWallet(undefined)
        })
      : Promise.resolve()
  }

  // store
  const store: WalletStore = {
    get $hasInited() {
      return $hasInited()
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
    connect,
    disconnect
  }
  return store
})
