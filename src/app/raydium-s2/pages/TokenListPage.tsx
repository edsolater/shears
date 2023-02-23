import { createEffect } from 'solid-js'
import { useSDKToken } from '../features/$root/storeUtils'

export function TokenListPage() {
  const { allTokens } = useSDKToken()

  createEffect(() => console.log('allTokens', allTokens()))
  return <div>TokenListPage</div>
}
