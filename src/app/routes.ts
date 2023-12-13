import { RouteDefinition, useLocation, useMatch } from '@solidjs/router'
import { lazy } from 'solid-js'
import { createLazyMemo } from '../packages/pivkit'
import PlaygroundPage from './pageComponents/PlaygroundPage'
import FarmPage from './pageComponents/FarmPage'
import AmmPoolsPage from './pageComponents/AmmPoolsPage'
import SwapPage from './pageComponents/SwapPage'
import HomePage from './pageComponents/HomePage'

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

export const needAppPageLayout = {
  [routePath.swap]: true,
  [routePath.pools]: true,
  [routePath.farms]: true,
}
export const routes: RouteDefinition[] = [
  { path: routePath.home, component: HomePage },
  { path: routePath.swap, component: SwapPage },
  { path: routePath.pools, component: AmmPoolsPage },
  { path: routePath.farms, component: FarmPage },
  { path: routePath.playground, component: PlaygroundPage },
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
