import { DataStoreProvider } from '../modules/stores'
import { AppContentPage } from './TokenListPage'

export function App() {
  return (
    <DataStoreProvider>
      <AppContentPage />
    </DataStoreProvider>
  )
}
