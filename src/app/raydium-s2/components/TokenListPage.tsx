import { Piv } from '../../../packages/piv/Piv'
import { useDataStore } from '../modules/stores/store'
import { useWalletAdapter } from '../modules/stores/store-wallet'
import { Container } from '../../../packages/pivkit/components/Container'
import { PairsPanel } from './Pairs/Panel'

export function AppContentPage() {
  const { allTokens, isTokenLoading, allAPIPairs, isPairsLoading } = useDataStore()
  const {} = useWalletAdapter()

  return (
    <div>
      <Piv icss={{ fontSize: '2em' }}>AppContentPage</Piv>
      <Piv>token count: {isTokenLoading() ? '(loading)' : allTokens().length}</Piv>
      <Piv>pair count: {isPairsLoading() ? '(loading)' : allAPIPairs().length}</Piv>
      <Container icss={{ width: 'fit-content', resize: 'both', overflow: 'hidden' }}>
        {({ width, height }) => (
          <PairsPanel infos={allAPIPairs()} containerHeight={height()} containerWidth={width()} />
        )}
      </Container>
    </div>
  )
}
