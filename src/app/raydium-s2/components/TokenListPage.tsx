import { Piv } from '../../../packages/piv/Piv'
import { useWalletAdapter } from '../modules/stores/store_wallet'
import { useDataStore } from '../modules/stores/store'

export function TokenListPage() {
  const { allTokens, isTokenLoading, allAPIPairs, isPairsLoading } = useDataStore()
  const {} = useWalletAdapter()
  return (
    <div>
      <Piv icss={{ fontSize: '2em' }}>TokenListPage </Piv>
      <Piv>token count: {isTokenLoading() ? '(loading)' : allTokens().length}</Piv>
      <Piv>pair count: {isPairsLoading() ? '(loading)' : allAPIPairs().length}</Piv>
    </div>
  )
}
