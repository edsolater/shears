import { JSX } from "solid-js"
import ClmmsPage from "../pages/clmm"
import FarmPage from "../pages/farm"
import HomePage from "../pages/home"
import PlaygroundPage from "../pages/playground"
import PoolsPage from "../pages/pool"
import SwapPage from "../pages/swap"

type RouteItem = {
  name: string
  path: string
  component: () => JSX.Element
  icon?: string

  visible: boolean
  needAppKeeper: boolean
}

function createRouteItem(options: RouteItem): RouteItem {
  return {
    name: options.name,
    path: options.path,
    component: options.component,
    icon: options.icon,
    visible: options.visible,
    needAppKeeper: options.needAppKeeper,
  }
}

export const poolsRoutePath = "/pools"
export const homeRoutePath = "/"
export const farmsRoutePath = "/farms"
export const playgroundRoutePath = "/playground"
export const swapRoutePath = "/swap"
export const clmmRoutePath = "/clmm"

export const homeRouteItem = createRouteItem({
  name: "home",
  path: homeRoutePath,
  component: HomePage,
  needAppKeeper: false,
  visible: false,
})
export const swapRouteItem = createRouteItem({
  name: "swap",
  path: swapRoutePath,
  component: SwapPage,
  icon: "/icons/entry-icon-swap.svg",
  visible: true,
  needAppKeeper: true,
})
export const poolsRouteItem = createRouteItem({
  name: "pools",
  path: poolsRoutePath,
  component: PoolsPage,
  icon: "/icons/entry-icon-pools.svg",
  visible: true,
  needAppKeeper: true,
})
export const farmsRouteItem = createRouteItem({
  name: "farms",
  path: farmsRoutePath,
  component: FarmPage,
  icon: "/icons/entry-icon-farms.svg",
  visible: true,
  needAppKeeper: true,
})
export const playgroundRouteItem = createRouteItem({
  name: "playground",
  path: playgroundRoutePath,
  component: PlaygroundPage,
  visible: true,
  needAppKeeper: true,
})
export const clmmRouteItem = createRouteItem({
  name: "clmm",
  path: clmmRoutePath,
  component: ClmmsPage,
  visible: true,
  needAppKeeper: true,
})
export const routes = [homeRouteItem, swapRouteItem, poolsRouteItem, farmsRouteItem, playgroundRouteItem, clmmRouteItem]

export const isLocalhost = () => window.location.hostname === "localhost"
