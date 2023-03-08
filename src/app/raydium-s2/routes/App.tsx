import { useRoutes } from '@solidjs/router'
import { routes } from './routes'
import '../styles/index.css'

export function App() {
  const Routes = useRoutes(routes)
  return <Routes />
}
