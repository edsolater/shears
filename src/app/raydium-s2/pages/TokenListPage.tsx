import { Piv } from '../../../packages/piv/Piv'
import { useSDKToken } from '../modules/tokens/store'

export function TokenListPage() {
  const { allTokens, tokensCount, isLoading } = useSDKToken()
  return (
    <div>
      <Piv icss={{ fontSize: '2em' }}>TokenListPage</Piv>
      <Piv>token count: {isLoading() ? '(loading)' : tokensCount()}</Piv>
    </div>
  )
}
