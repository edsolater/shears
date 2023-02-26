import { Piv } from '../../../packages/piv/Piv'
import { useWalletAdapter } from '../modules/tokens/store_wallet'
import { useDataStore } from '../modules/tokens/store'

export function TokenListPage() {
  const { allTokens, isTokenLoading } = useDataStore()
  const {} = useWalletAdapter()
  return (
    <div>
      <Piv icss={{ fontSize: '2em' }}>TokenListPage </Piv>
      <Piv>token count: {isTokenLoading() ? '(loading)' : allTokens().length}</Piv>
    </div>
  )
}
