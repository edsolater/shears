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

export type WalletAdapterInterface = {
  adapter: WalletAdapter
}

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
