import { createEffect } from 'solid-js'
import { Button, createDisclosure } from '../../packages/pivkit'
import { useWalletStore } from '../stores/wallet/store'
import { getWalletAdapter } from '../stores/wallet/utils/getWalletAdapter'

/** this should be used in ./Navbar.tsx */
export function WalletWidget() {
  const walletStore = useWalletStore()

  const [isCopied, { off, on }] = createDisclosure()

  createEffect(() => {
    if (isCopied()) off()
  })

  return (
    <Button
      onClick={() =>
        walletStore.connected ? walletStore.disconnect() : walletStore.connect(getWalletAdapter('Phantom'))
      }
      // TODO: onHover : change text
      icss={{ width: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
    >
      {walletStore.connected ? `${walletStore.owner?.slice(0, 6)}...${walletStore.owner?.slice(-6)}` : 'Connect Wallet'}
    </Button>
  )
}
