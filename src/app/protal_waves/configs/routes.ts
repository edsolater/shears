import { RouteDefinition } from '@solidjs/router'
import { lazy } from 'solid-js'

export const homeRoutePath = '/'
export const playgroundRoutePath = '/playground'

export const routePath = {
  home: homeRoutePath,
  playground: playgroundRoutePath,
}

const PageComponentHome = import('../pages/Home')
const PageComponentPlayground = import('../pages/Playground')

// preload all pages
Promise.allSettled([PageComponentHome, PageComponentPlayground])

export const routes: RouteDefinition[] = [
  { path: routePath.home, component: lazy(() => PageComponentHome) },
  { path: routePath.playground, component: lazy(() => PageComponentPlayground) },
]
