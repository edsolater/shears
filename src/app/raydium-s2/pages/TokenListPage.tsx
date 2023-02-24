import { createEffect } from 'solid-js'
import { Piv } from '../../../packages/piv/Piv'
import { useSDKToken } from '../app-modules/tokens/store'
import MyWorker from '../app-modules/worker?worker'

export function TokenListPage() {
  const { allTokens, tokensCount } = useSDKToken()
  createEffect(() => console.log('allTokens', allTokens()))
  const worker = new MyWorker()
  worker.postMessage('hello')
  return (
    <div>
      <Piv icss={{ fontSize: '2em' }}>TokenListPage</Piv>
      <Piv>token count: {tokensCount()}</Piv>
    </div>
  )
}
