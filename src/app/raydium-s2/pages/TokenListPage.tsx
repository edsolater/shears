import { createEffect } from 'solid-js'
import { Piv } from '../../../packages/piv/Piv'
import { useSDKToken } from '../features/$root/storeUtils'

export function TokenListPage() {
  const { allTokens, tokensCount } = useSDKToken()
  createEffect(() => console.log('allTokens', allTokens()))
  return (
    <div>
      <Piv icss={{ fontSize: '2em' }}>TokenListPage</Piv>
      <Piv>token count: {tokensCount()}</Piv>
    </div>
  )
}
