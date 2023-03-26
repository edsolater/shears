import { Piv } from '../../../packages/piv'
import { Box } from '../../../packages/pivkit'
import { useWalletStore } from '../stores/wallet/store'
import { Link } from '../components/Link'
import { NavBar } from '../components/NavBar'
import { routePath } from './routes'
import { useDataStore } from '../stores/data/store'
import { createEffect } from 'solid-js'

export function Home() {
  const dataStore = useDataStore()
  const walletStore = useWalletStore()
  createEffect(() => console.log('dataStore.allTokens', dataStore.allTokens))
  return (
    <div>
      <NavBar />

      <Box icss={{ margin: 8 }}>
        {/* info */}
        <Piv>token count: {dataStore.isTokenLoading ? '(loading)' : dataStore.allTokens?.length}</Piv>
        <Piv>current owner: {walletStore.owner}</Piv>
        <Piv>pair count: {dataStore.isLoading ? '(loading)' : dataStore.pairInfos?.length}</Piv>
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
