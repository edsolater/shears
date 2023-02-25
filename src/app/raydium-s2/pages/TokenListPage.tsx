import { Piv } from '../../../packages/piv/Piv'
import { useSDKToken } from '../modules/tokens/store-tokens'
import { useWalletAdapter } from '../modules/tokens/store-wallet'

export function TokenListPage() {
  const { allTokens, tokensCount, isLoading } = useSDKToken()
  const {} = useWalletAdapter()
  return (
    <div>
      <Piv icss={{ fontSize: '2em' }}>TokenListPage</Piv>
      <Piv>token count: {isLoading() ? '(loading)' : tokensCount()}</Piv>
    </div>
  )
}
