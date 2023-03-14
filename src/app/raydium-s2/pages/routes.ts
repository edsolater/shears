import { RouteDefinition } from '@solidjs/router'
import { FarmPage } from './Farms'
import { Home } from './Home'
import { PairsPanel } from './Pairs'

export const routePath = {
  pools: '/pools',
  home: '/',
  farms: '/farms'
}
export const routes: RouteDefinition[] = [
  { path: routePath.home, component: Home },
  { path: routePath.pools, component: PairsPanel },
  { path: routePath.farms, component: FarmPage }
]
