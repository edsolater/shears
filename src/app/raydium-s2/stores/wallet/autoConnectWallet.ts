import toPubString from '../common/utils/pub'
import { WalletAdapterInterface } from './type'
import { connectWallet } from './connectWallet'
import { findWalletAdapter } from './findWalletAdapter'

export async function autoConnectWallet(cbs?: {
  onLoadSuccess?(utils: { owner: string; adapterInterface: WalletAdapterInterface }): void
  onBeforeInit?(): void
  onAfterInit?(): void
}) {
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
