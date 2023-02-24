import { createEffect } from 'solid-js'
import { Piv } from '../../../packages/piv/Piv'
import { useSDKToken } from '../app-modules/tokens/store'
import { getInfo } from '../app-modules/worker-receiver'

export function TokenListPage() {
  const { allTokens, tokensCount } = useSDKToken()
  createEffect(() => console.log('allTokens', allTokens()))
  getInfo()
  return (
    <div>
      <Piv icss={{ fontSize: '2em' }}>TokenListPage</Piv>
      <Piv>token count: {tokensCount()}</Piv>
    </div>
  )
}
