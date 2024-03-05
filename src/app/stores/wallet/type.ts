import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
} from "@solana/wallet-adapter-wallets"

export interface WalletAdapterInterface {
  adapter: PhantomWalletAdapter | TrustWalletAdapter | SolflareWalletAdapter | LedgerWalletAdapter
}

export type WalletsNames = "Phantom" | "Trust" | "Solflare" | "Ledger"
