import { Box, Modal, Piv } from '../../packages/pivkit'
import { Link } from '../components/Link'
import { routePath } from '../routes'
import { store } from '../stores/data/store'
import { useWalletStore } from '../stores/wallet/store'
import { getSize } from '../utils/dataTransmit/getItems'

export default function Home() {
  const walletStore = useWalletStore()
  return (
    <div>
      <Box icss={{ margin: '8px' }}>
        {/* info */}
        <Piv>token count: {store.isTokenListLoading ? '(loading)' : getSize(store.tokens)}</Piv>
        <Piv>current owner: {walletStore.owner}</Piv>
        <Piv>pair count: {store.isPairInfoLoading ? '(loading)' : getSize(store.pairInfos)}</Piv>
        <Piv>
          nav:
          <Link innerRoute href={routePath.farms}>
            Farms
          </Link>
          <Link innerRoute href={routePath.pools}>
            Pools
          </Link>
        </Piv>
      </Box>
    </div>
  )
}
