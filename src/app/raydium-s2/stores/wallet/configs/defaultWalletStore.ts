import { supportedWallets } from './supportedWallets'
import { WalletsNames, WalletStore } from '../types/type'

export const defaultWalletStore = {
  $hasInited: false,
  connected: false,
  wallets: supportedWallets
} satisfies WalletStore
