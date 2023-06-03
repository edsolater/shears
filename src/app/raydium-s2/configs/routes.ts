import { RouteDefinition } from '@solidjs/router'
import { lazy } from 'solid-js'

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
  { path: routePath.home, component: lazy(() => import('../pages/Home')) },
  { path: routePath.swap, component: lazy(() => import('../pages/Swap')) },
  { path: routePath.pools, component: lazy(() => import('../pages/Pairs')) },
  { path: routePath.farms, component: lazy(() => import('../pages/Farms')) },
  { path: routePath.playground, component: lazy(() => import('../pages/Playground')) },
]
