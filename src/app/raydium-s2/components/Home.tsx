import { Piv } from '@edsolater/piv'
import { Box } from '@edsolater/pivkit'
import { useNavigate } from '@solidjs/router'
import { JSXElement } from 'solid-js'
import { usePairStore } from '../stores/pairs/store'
import { useTokenStore } from '../stores/tokens/store'
import { useWalletStore } from '../stores/wallet/store'

export function Home() {
  const { allPairJsonInfos, isPairsLoading } = usePairStore()
  const { owner } = useWalletStore()
  const { allTokens, isTokenLoading } = useTokenStore()
  return (
    <div>
      <Box icss={{ display: 'grid', marginBlock: 16, placeContent: 'center' }}>
        <Piv icss={{ fontSize: '2em' }}>Raydium-S2</Piv>
      </Box>
      <Box icss={{ margin: 8 }}>
        {/* info */}
        <Piv>token count: {isTokenLoading() ? '(loading)' : allTokens().length}</Piv>
        <Piv>current owner: {owner?.()}</Piv>
        <Piv>pair count: {isPairsLoading() ? '(loading)' : allPairJsonInfos().length}</Piv>
        <Piv>
          nav:
          <RouteLink href='/farms'>Farms</RouteLink>
          <RouteLink href='/pools'>Pools</RouteLink>
        </Piv>
      </Box>
    </div>
  )
}
function RouteLink(props: { href: string; children?: JSXElement }) {
  const navigate = useNavigate()
  return <Piv onClick={() => navigate(props.href)}>{props.children}</Piv>
}
