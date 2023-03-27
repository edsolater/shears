import { RouteDefinition } from '@solidjs/router'
import { FarmPage } from './Farms'
import { Home } from './Home'
import { PairsPanel } from './Pairs'
import { PlaygroundPage } from './Playground'

export const routePath = {
  pools: '/pools',
  home: '/',
  farms: '/farms',
  playground: '/playground',
}
export const routes: RouteDefinition[] = [
  { path: routePath.home, component: Home },
  { path: routePath.pools, component: PairsPanel },
  { path: routePath.farms, component: FarmPage },
  { path: routePath.playground, component: PlaygroundPage }
]
