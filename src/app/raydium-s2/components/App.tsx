import { RouteDefinition, useRoutes } from '@solidjs/router'
import { FarmPanel } from './FarmsPanel'
import { Home } from './Home'
import { PairsPanel } from './PairsPanel'

const routes: RouteDefinition[] = [
  { path: '/', component: Home },
  { path: '/pools', component: PairsPanel },
  { path: '/farms', component: FarmPanel }
]

export function App() {
  const Routes = useRoutes(routes)
  return <Routes />
}
