import { WalletAdapter } from '@solana/wallet-adapter-base'

export type WalletAdapterInterface = {
  adapter: WalletAdapter
}

export type WalletsNames =
  | 'Phantom'
  | 'Trust'
  | 'Solflare'
  | 'Sollet'
  | 'Torus'
  | 'Ledger'
  | 'SolletExtension'
  | 'Math'
  | 'TokenPocket'
  | 'Coinbase'
  | 'Solong'
  | 'Coin98'
  | 'SafePal'
  | 'Slope'
  | 'Bitpie'
  | 'Glow'
  | 'BitKeep'
  | 'Exodus'
  | 'Clover'
  | 'Coinhub'
  | 'Backpack'
  | 'Brave'
