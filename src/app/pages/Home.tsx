import { Box, Modal, Piv } from '../../packages/pivkit'
import { Link } from '../components/Link'
import { routePath } from '../configs/routes'
import { store } from '../stores/data/dataStore'
import { useWalletStore } from '../stores/wallet/store'

export default function Home() {
  const walletStore = useWalletStore()
  return (
    <div>
      
      <Box icss={{ margin: '8px' }}>
        {/* info */}
        <Piv>token count: {store.isTokenListLoading ? '(loading)' : store.tokens?.size}</Piv>
        <Piv>current owner: {walletStore.owner}</Piv>
        <Piv>pair count: {store.isPairInfoLoading ? '(loading)' : store.pairInfos?.size}</Piv>
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

function SettingPanel() {
  return (
    <Modal>
      <Piv>setting</Piv>
    </Modal>
  )
}
