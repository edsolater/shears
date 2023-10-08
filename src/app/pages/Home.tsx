import { Box, Piv, useAtom } from '../../packages/pivkit'
import { Link } from '../components/Link'
import { NavBar } from '../components/NavBar'
import { routePath } from '../configs/routes'
import { pairInfosAtom, isPairInfoLoadingAtom } from '../stores/data/atoms'
import { useDataStore } from '../stores/data/store'
import { useWalletStore } from '../stores/wallet/store'

export default function Home() {
  const dataStore = useDataStore()
  const { get: pairInfos } = useAtom(pairInfosAtom)
  const { get: isPairInfoLoading } = useAtom(isPairInfoLoadingAtom)

  const walletStore = useWalletStore()
  return (
    <div>
      <NavBar title='Home' />

      <Box icss={{ margin: '8px' }}>
        {/* info */}
        <Piv>token count: {dataStore.isTokenLoading ? '(loading)' : dataStore.allTokens?.length}</Piv>
        <Piv>current owner: {walletStore.owner}</Piv>
        <Piv>pair count: {isPairInfoLoading() ? '(loading)' : pairInfos()?.length}</Piv>
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
