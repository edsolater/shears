import { createEffect, createMemo, createSignal, Setter } from "solid-js"
import { createCachedGlobalHook } from "@edsolater/pivkit"
import toPubString from "../../utils/dataStructures/Publickey"
import { Token } from "../data/token/type"
import { WalletAdapterInterface } from "./type"
import { connect } from "./methods/connect"
import { disconnect } from "./methods/disconnect"
import { initlyConnectPhantom } from "./methods/initlyConnectPhantom"
import { shuck_owner } from "../data/store"

export interface WalletStore {
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
  createEffect(() => {
    shuck_owner.set(owner())
  })
  createEffect(initlyConnectPhantom)
  const store: WalletStore = {
    $setters: {
      setHasInited,
      setConnected,
      setCurrentWallet,
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
    disconnect: disconnect,
  }
  return store
})

// TODO: use atom-like
export const useWalletOwner = () => createMemo(() => useWalletStore().owner)

// TODO: use atom-like
export const useWalletAdapter = () => createMemo(() => useWalletStore().currentWallet?.adapter)

