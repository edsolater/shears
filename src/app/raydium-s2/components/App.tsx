import { DataStoreProvider } from '../stores'
import { AppContentPage } from './TokenListPage'

export function App() {
  return (
    <DataStoreProvider>
      <AppContentPage />
    </DataStoreProvider>
  )
}
