import { RouteDefinition, useLocation, useMatch } from '@solidjs/router'
import { lazy } from 'solid-js'
import { createLazyMemo } from '../packages/pivkit'

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

const PageComponentHome = import('./pageComponents/Home')
const PageComponentSwap = import('./pageComponents/Swap')
const PageComponentPairs = import('./pageComponents/Pairs')
const PageComponentFarms = import('./pageComponents/Farms')
const PageComponentPlayground = import('./pageComponents/Playground')

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

/** usually used in side-menu  */
export function usePageMatcher() {
  const location = useLocation()
  return {
    get isHomePage() {
      return createLazyMemo(() => location.pathname === routePath.home) // TODO: currently, just use pure function get is better
    },
    get isSwapPage() {
      return createLazyMemo(() => location.pathname === routePath.swap)
    },
    get isPairsPage() {
      return createLazyMemo(() => location.pathname === routePath.pools)
    },
    get isFarmsPage() {
      return createLazyMemo(() => location.pathname === routePath.farms)
    },
    get isPlaygroundPage() {
      return createLazyMemo(() => location.pathname === routePath.playground)
    },
  }
}

// /** usually used in side-menu  */
// export function useNetworkContext() {
//   const location = useLocation()
//   return {
//     get isLocalhost() {
//       return createLazyMemo(() => window.location.hostname === 'localhost')
//     },
//   }
// }

export const isLocalhost = () => window.location.hostname === 'localhost'
