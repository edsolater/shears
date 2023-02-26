import { DataStoreProvider } from '../modules/tokens/store'
import { TokenListPage } from './TokenListPage'

export function App() {
  return (
    <DataStoreProvider>
      <TokenListPage />
    </DataStoreProvider>
  )
}
