import { Piv } from '@edsolater/piv'
import { Box, Button } from '@edsolater/pivkit'
import { useNavigate } from '@solidjs/router'
import { JSXElement } from 'solid-js'
import { usePairStore } from '../stores/pairs/store'
import { useTokenStore } from '../stores/tokens/store'
import { useWalletStore } from '../stores/wallet/store'
import { Link } from '../uikit/Link'
import { NavBar } from '../components/NavBar'
import { routePath } from '../components/routes'

export function Home() {
  const pairStore = usePairStore()
  const walletStore = useWalletStore()
  const tokenStore = useTokenStore()
  return (
    <div>
      <Box icss={{ display: 'grid', marginBlock: 16, placeContent: 'center' }}>
        <Piv icss={{ fontSize: '2em' }}>Raydium-S2</Piv>
      </Box>

      <NavBar />

      <Box icss={{ margin: 8 }}>
        {/* info */}
        <Piv>token count: {tokenStore.isTokenLoading ? '(loading)' : tokenStore.allTokens.length}</Piv>
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
