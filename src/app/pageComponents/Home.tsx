import { Box, Piv } from '../../packages/pivkit'
import { store } from '../stores/data/store'
import { useWalletStore } from '../stores/wallet/store'
import { getSize } from '../utils/dataTransmit/getItems'

export default function HomePage() {
  const walletStore = useWalletStore()
  return (
    <div>
      <Box icss={{ margin: '8px' }}>
        {/* info */}
        <Piv>token count: {store.isTokenListLoading ? '(loading)' : getSize(store.tokens)}</Piv>
        <Piv>current owner: {walletStore.owner}</Piv>
        <Piv>pair count: {store.isPairInfoLoading ? '(loading)' : getSize(store.pairInfos)}</Piv>
      </Box>
    </div>
  )
}
