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

const PageComponentHome = import('../pages/Home')
const PageComponentSwap = import('../pages/Swap')
const PageComponentPairs = import('../pages/Pairs')
const PageComponentFarms = import('../pages/Farms')
const PageComponentPlayground = import('../pages/Playground')

// preload all pages
Promise.allSettled([
  PageComponentHome,
  PageComponentSwap,
  PageComponentPairs,
  PageComponentFarms,
  PageComponentPlayground,
])

export const routes: RouteDefinition[] = [
  { path: routePath.home, component: lazy(() => PageComponentHome) },
  { path: routePath.swap, component: lazy(() => PageComponentSwap) },
  { path: routePath.pools, component: lazy(() => PageComponentPairs) },
  { path: routePath.farms, component: lazy(() => PageComponentFarms) },
  { path: routePath.playground, component: lazy(() => PageComponentPlayground) },
]
