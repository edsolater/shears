import { supportedWallets } from './supportedWallets'

/**
 * util function
 */
export function findWalletAdapter(name: string) {
  return supportedWallets.find((wallet) => wallet.adapter.name.toLowerCase() === name.toLowerCase())
}
