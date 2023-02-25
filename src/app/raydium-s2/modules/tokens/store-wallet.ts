import { assert, isString } from '@edsolater/fnkit'
import { WalletAdapter } from '@solana/wallet-adapter-base'
import {
  BackpackWalletAdapter,
  BitKeepWalletAdapter,
  BitpieWalletAdapter,
  BraveWalletAdapter,
  CloverWalletAdapter,
  Coin98WalletAdapter,
  CoinbaseWalletAdapter,
  CoinhubWalletAdapter,
  ExodusWalletAdapter,
  GlowWalletAdapter,
  LedgerWalletAdapter,
  MathWalletAdapter,
  PhantomWalletAdapter,
  SafePalWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  SolongWalletAdapter,
  TokenPocketWalletAdapter,
  TorusWalletAdapter,
  TrustWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { createStore } from 'solid-js/store'
import toPubString from '../$root/utils/pub'

type WalletAdapterInterface = {
  adapter: WalletAdapter
}

type WalletStore = {
  $hasInited: boolean
  connected: boolean
  currentWallet?: WalletAdapterInterface
  wallets: WalletAdapterInterface[]
  owner?: string
}

const supportedWallets: WalletAdapterInterface[] = [
  { adapter: new PhantomWalletAdapter() },
  { adapter: new TrustWalletAdapter() },
  { adapter: new SolflareWalletAdapter() },
  { adapter: new SolletWalletAdapter() },
  { adapter: new TorusWalletAdapter() },
  { adapter: new LedgerWalletAdapter() },
  { adapter: new SolletExtensionWalletAdapter() },
  { adapter: new MathWalletAdapter() },
  { adapter: new TokenPocketWalletAdapter() },
  { adapter: new CoinbaseWalletAdapter() },
  { adapter: new SolongWalletAdapter() },
  { adapter: new Coin98WalletAdapter() },
  { adapter: new SafePalWalletAdapter() },
  { adapter: new SlopeWalletAdapter() },
  { adapter: new BitpieWalletAdapter() },
  { adapter: new GlowWalletAdapter() },
  { adapter: new BitKeepWalletAdapter() },
  { adapter: new ExodusWalletAdapter() },
  { adapter: new CloverWalletAdapter() },
  { adapter: new CoinhubWalletAdapter() },
  { adapter: new BackpackWalletAdapter() },
  { adapter: new BraveWalletAdapter() }
]
export type WalletsNames =
  | PhantomWalletAdapter['name']
  | TrustWalletAdapter['name']
  | SolflareWalletAdapter['name']
  | SolletWalletAdapter['name']
  | TorusWalletAdapter['name']
  | LedgerWalletAdapter['name']
  | SolletExtensionWalletAdapter['name']
  | MathWalletAdapter['name']
  | TokenPocketWalletAdapter['name']
  | CoinbaseWalletAdapter['name']
  | SolongWalletAdapter['name']
  | Coin98WalletAdapter['name']
  | SafePalWalletAdapter['name']
  | SlopeWalletAdapter['name']
  | BitpieWalletAdapter['name']
  | GlowWalletAdapter['name']
  | BitKeepWalletAdapter['name']
  | ExodusWalletAdapter['name']
  | CloverWalletAdapter['name']
  | CoinhubWalletAdapter['name']
  | BackpackWalletAdapter['name']
  | BraveWalletAdapter['name']

export const walletsNames = supportedWallets.map((w) => w.adapter.name) as WalletsNames[]

const defaultWalletStore = { $hasInited: false, connected: false, wallets: supportedWallets } satisfies WalletStore

/**
 * @todo it's should be a context. thus, `useContext(sdkToken)` is better to read.
 * solidjs store
 */
export function useWalletAdapter() {
  const [store, setStore] = createStore<WalletStore>(defaultWalletStore)
  const initLoad = async (cbs?: {
    onLoadSuccess?(utils: { owner: string; adapterInterface: WalletAdapterInterface }): void
    onBeforeInit?(): void
    onAfterInit?(): void
  }) => {
    cbs?.onBeforeInit?.()
    const phantomWallet = findWalletAdapter('phantom')
    if (!phantomWallet) {
      throw new Error('Phantom wallet not found')
    }
    connectWallet(phantomWallet).then(() => {
      if (!phantomWallet.adapter.publicKey) {
        throw new Error('Phantom wallet not connected')
      }
      const owner = toPubString(phantomWallet.adapter.publicKey)
      cbs?.onLoadSuccess?.({ owner, adapterInterface: phantomWallet })
    })
    cbs?.onAfterInit?.()
  }
  initLoad({
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

function findWalletAdapter(name: string) {
  return supportedWallets.find((wallet) => wallet.adapter.name.toLowerCase() === name.toLowerCase())
}

function connectWallet(
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
