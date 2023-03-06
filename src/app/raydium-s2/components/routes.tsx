import { RouteDefinition } from '@solidjs/router'
import { FarmPanel } from './FarmsPanel'
import { Home } from './Home'
import { PairsPanel } from './PairsPanel'

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
