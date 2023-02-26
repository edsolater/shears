import { Provider } from '../modules/tokens/store_tokens'
import { TokenListPage } from './TokenListPage'

export function App() {
  return (
    <Provider>
      <TokenListPage />
    </Provider>
  )
}
