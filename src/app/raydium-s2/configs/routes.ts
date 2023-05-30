import { RouteDefinition } from '@solidjs/router'
import { FarmPage } from '../pages/Farms'
import { Home } from '../pages/Home'
import { PairsPanel } from '../pages/Pairs'
import { PlaygroundPage } from '../pages/Playground'
import { SwapPage } from '../pages/Swap'

export const pairsRoutePath = '/pools'
export const homeRoutePath = '/'
export const farmsRoutePath = '/farms'
export const playgroundRoutePath = '/playground'
export const swapRoutePath = '/swap'

export const routePath = {
  pools: pairsRoutePath,
  home: homeRoutePath,
  farms: farmsRoutePath,
  playground: playgroundRoutePath,
  swap: swapRoutePath,
}
export const routes: RouteDefinition[] = [
  { path: routePath.home, component: Home },
  { path: routePath.swap, component: SwapPage },
  { path: routePath.pools, component: PairsPanel },
  { path: routePath.farms, component: FarmPage },
  { path: routePath.playground, component: PlaygroundPage },
]
