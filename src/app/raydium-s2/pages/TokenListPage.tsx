import { Piv } from '../../../packages/piv/Piv'
import { useSDKToken } from '../modules/tokens/store_tokens'
import { useWalletAdapter } from '../modules/tokens/store_wallet'

export function TokenListPage() {
  const { allTokens, isLoading } = useSDKToken()
  const {} = useWalletAdapter()
  return (
    <div>
      <Piv icss={{ fontSize: '2em' }}>TokenListPage </Piv>
      <Piv>token count: {isLoading() ? '(loading)' : allTokens().length}</Piv>
    </div>
  )
}
