import { Piv } from '../../../packages/piv'
import { Box } from '../../../packages/pivkit'
import { usePairsStore } from '../stores/pairs/store'
import { useTokenListStore } from '../stores/tokenList/store'
import { useWalletStore } from '../stores/wallet/store'
import { Link } from '../components/Link'
import { NavBar } from '../components/NavBar'
import { routePath } from './routes'

export function Home() {
  const pairStore =usePairsStore()
  const walletStore = useWalletStore()
  const tokenListStore = useTokenListStore()
  return (
    <div>
      <NavBar />

      <Box icss={{ margin: 8 }}>
        {/* info */}
        <Piv>token count: {tokenListStore.isLoading ? '(loading)' : tokenListStore.allTokens.size}</Piv>
        <Piv>current owner: {walletStore.owner}</Piv>
        <Piv>pair count: {pairStore.isLoading ? '(loading)' : pairStore.infos.length}</Piv>
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
