import { RouteDefinition } from '@solidjs/router'
import { FarmPage } from '../pages/Farms'
import { Home } from '../pages/Home'
import { PairsPanel } from '../pages/Pairs'
import { PlaygroundPage } from '../pages/Playground'

export const pairsRoutePath = '/pools'
export const homeRoutePath = '/'
export const farmsRoutePath = '/farms'
export const playgroundRoutePath = '/playground'

export const routePath = {
  pools: pairsRoutePath,
  home: homeRoutePath,
  farms: farmsRoutePath,
  playground: playgroundRoutePath
}
export const routes: RouteDefinition[] = [
  { path: routePath.home, component: Home },
  { path: routePath.pools, component: PairsPanel },
  { path: routePath.farms, component: FarmPage },
  { path: routePath.playground, component: PlaygroundPage }
]
