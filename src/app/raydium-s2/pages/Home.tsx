import { Piv } from '../../../packages/piv'
import { Box } from '../../../packages/pivkit'
import { useTokenListAtom } from '../atoms/tokenListAtom'
import { Link } from '../components/Link'
import { NavBar } from '../components/NavBar'
import { routePath } from '../routes/routes'
import { usePairStore } from '../stores/pairs/store'
import { useWalletStore } from '../stores/wallet/store'

export function Home() {
  const pairStore = usePairStore()
  const walletStore = useWalletStore()
  const tokenListAtom = useTokenListAtom()
  return (
    <div>
      <NavBar />

      <Box icss={{ margin: 8 }}>
        {/* info */}
        <Piv>token count: {tokenListAtom.isLoading ? '(loading)' : tokenListAtom.allTokens.size}</Piv>
        <Piv>current owner: {walletStore.owner}</Piv>
        <Piv>pair count: {pairStore.isPairsLoading ? '(loading)' : pairStore.allPairJsonInfos.length}</Piv>
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
