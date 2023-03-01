import { DataStoreProvider } from '../modules/stores/store'
import { AppContentPage } from './TokenListPage'

export function App() {
  return (
    <DataStoreProvider>
      <AppContentPage />
    </DataStoreProvider>
  )
}
