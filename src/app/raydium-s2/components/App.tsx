import { useRoutes } from '@solidjs/router'
import { routes } from './routes'

export function App() {
  const Routes = useRoutes(routes)
  return <Routes />
}
