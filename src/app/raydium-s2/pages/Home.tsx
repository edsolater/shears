import { Piv } from '../../../packages/piv'
import { Box } from '../../../packages/pivkit'
import { Link } from '../components/Link'
import { NavBar } from '../components/NavBar'
import { routePath } from '../configs/routes'
import { useDataStore } from '../stores/data/store'
import { useWalletStore } from '../stores/wallet/store'

export default function Home() {
  const dataStore = useDataStore()
  const walletStore = useWalletStore()
  return (
    <div>
      <NavBar title='Home' />

      <Box icss={{ margin: 8 }}>
        {/* info */}
        <Piv>token count: {dataStore.isTokenLoading ? '(loading)' : dataStore.allTokens?.length}</Piv>
        <Piv>current owner: {walletStore.owner}</Piv>
        <Piv>pair count: {dataStore.isPairInfoLoading ? '(loading)' : dataStore.pairInfos?.length}</Piv>
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
