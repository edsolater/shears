import { Box, Piv } from '../../packages/pivkit'
import { Link } from '../components/Link'
import { NavBar } from '../components/NavBar'
import { routePath } from '../configs/routes'
import { store } from '../stores/data/dataStore'
import { useWalletStore } from '../stores/wallet/store'

export default function Home() {

  const walletStore = useWalletStore()
  return (
    <div>
      <NavBar title='Home' />

      <Box icss={{ margin: '8px' }}>
        {/* info */}
        <Piv>token count: {store.isTokenListLoading ? '(loading)' : store.tokens?.length}</Piv>
        <Piv>current owner: {walletStore.owner}</Piv>
        <Piv>pair count: {store.isPairInfoLoading ? '(loading)' : store.pairInfos?.length}</Piv>
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
