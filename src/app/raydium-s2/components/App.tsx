import { DataStoreProvider } from '../modules/stores/store'
import { TokenListPage } from './TokenListPage'

export function App() {
  return (
    <DataStoreProvider>
      <TokenListPage />
    </DataStoreProvider>
  )
}
