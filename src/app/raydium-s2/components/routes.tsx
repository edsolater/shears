import { RouteDefinition } from '@solidjs/router'
import { FarmPanel } from './pages/Farms'
import { Home } from './pages/Home'
import { PairsPanel } from './pages/Pairs'

export const routePath = {
  pools: '/pools',
  home: '/',
  farms: '/farms'
}
export const routes: RouteDefinition[] = [
  { path: routePath.home, component: Home },
  { path: routePath.pools, component: PairsPanel },
  { path: routePath.farms, component: FarmPanel }
]
