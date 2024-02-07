import { RouteDefinition, useLocation } from '@solidjs/router'
import { createLazyMemo } from '@edsolater/pivkit'
import PoolsPage from './pages/Pool'
import FarmPage from './pages/Farm'
import HomePage from './pages/Home'
import PlaygroundPage from './pages/Playground'
import SwapPage from './pageComponents/SwapPage'
import ClmmsPage from './pages/Clmm'
import { JSX } from 'solid-js'
import { Optional } from '@edsolater/fnkit'

export const pairsRoutePath = '/pools'
export const homeRoutePath = '/'
export const farmsRoutePath = '/farms'
export const playgroundRoutePath = '/playground'
export const swapRoutePath = '/swap'
export const clmmPath = '/clmm'

export const routePath = {
  pools: pairsRoutePath,
  home: homeRoutePath,
  farms: farmsRoutePath,
  playground: playgroundRoutePath,
  swap: swapRoutePath,
  clmm: clmmPath,
}

export const needAppPageLayout = {
  [routePath.swap]: true,
  [routePath.pools]: true,
  [routePath.farms]: true,
  [routePath.clmm]: true,
}
export const routes = [
  createRouteItem({
    visiable: false,
    name: 'home',
    path: routePath.home,
    component: HomePage,
    icon: '/icons/entry-icon-swap.svg',
  }),
  createRouteItem({ name: 'swap', path: routePath.swap, component: SwapPage, icon: '/icons/entry-icon-swap.svg' }),
  createRouteItem({ name: 'pools', path: routePath.pools, component: PoolsPage, icon: '/icons/entry-icon-pools.svg' }),
  createRouteItem({ name: 'farms', path: routePath.farms, component: FarmPage, icon: '/icons/entry-icon-farms.svg' }),
  createRouteItem({
    name: 'playground',
    path: routePath.playground,
    component: PlaygroundPage,
    icon: '/icons/entry-icon-swap.svg',
  }),
  createRouteItem({ name: 'clmm', path: routePath.clmm, component: ClmmsPage, icon: '/icons/entry-icon-swap.svg' }),
]

type RouteItem = {
  name: string
  path: string
  component: () => JSX.Element
  icon: string
  visiable: boolean
}

function createRouteItem(options: Optional<RouteItem, 'icon' | 'visiable'>): RouteItem {
  return {
    name: options.name,
    path: options.path,
    component: options.component,
    icon: options.icon ?? '',
    visiable: Boolean(options.visiable ?? true),
  }
}

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
    get isClmmPage() {
      return createLazyMemo(() => location.pathname === routePath.clmm)
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
