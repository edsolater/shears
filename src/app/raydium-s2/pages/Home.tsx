import { Piv } from '../../../packages/piv'
import { Box } from '../../../packages/pivkit'
import { usePairsAtom } from '../atoms/pairs/atom'
import { useTokenListAtom } from '../atoms/tokenList/atom'
import { Link } from '../components/Link'
import { NavBar } from '../components/NavBar'
import { routePath } from '../routes/routes'
import { useWalletStore } from '../atoms/wallet/store'

export function Home() {
  const pairAtom =usePairsAtom()
  const walletStore = useWalletStore()
  const tokenListAtom = useTokenListAtom()
  return (
    <div>
      <NavBar />

      <Box icss={{ margin: 8 }}>
        {/* info */}
        <Piv>token count: {tokenListAtom.isLoading ? '(loading)' : tokenListAtom.allTokens.size}</Piv>
        <Piv>current owner: {walletStore.owner}</Piv>
        <Piv>pair count: {pairAtom.isLoading ? '(loading)' : pairAtom.infos.length}</Piv>
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
