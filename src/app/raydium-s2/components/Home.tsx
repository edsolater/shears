import { Piv } from '@edsolater/piv'
import { Box, Button } from '@edsolater/pivkit'
import { useNavigate } from '@solidjs/router'
import { JSXElement } from 'solid-js'
import { usePairStore } from '../stores/pairs/store'
import { useTokenStore } from '../stores/tokens/store'
import { useWalletStore } from '../stores/wallet/store'
import { routePath } from "./routes"

export function Home() {
  const pairStore = usePairStore()
  const walletStore = useWalletStore()
  const tokenStore = useTokenStore()
  return (
    <div>
      <Box icss={{ display: 'grid', marginBlock: 16, placeContent: 'center' }}>
        <Piv icss={{ fontSize: '2em' }}>Raydium-S2</Piv>
      </Box>
      <Box icss={{ margin: 8 }}>
        {/* info */}
        <Piv>token count: {tokenStore.isTokenLoading ? '(loading)' : tokenStore.allTokens.length}</Piv>
        <Piv>current owner: {walletStore.owner}</Piv>
        <Piv>pair count: {pairStore.isPairsLoading ? '(loading)' : pairStore.allPairJsonInfos.length}</Piv>
        <Piv>
          nav:
          <RouteLink href={routePath.farms}>Farms</RouteLink>
          <RouteLink href={routePath.pools}>Pools</RouteLink>
        </Piv>
      </Box>
    </div>
  )
}
function RouteLink(props: { href: string; children?: JSXElement }) {
  const navigate = useNavigate()
  return <Button onClick={() => navigate(props.href)}>{props.children}</Button>
}
