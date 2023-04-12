import { useNavigate, useRoutes } from '@solidjs/router'
import { routes } from '../configs/routes'
import '../styles/index.css'
import {
  useAllRegisteredKeyboardShortcuts,
  useKeyboardGlobalShortcut,
  useKeyboardShortcut
} from '../../../packages/pivkit/features/useKeyboardShortcut'
import { createEffect } from 'solid-js'
import { WeakerMap, map } from '@edsolater/fnkit'
import { globalPageShortcuts } from '../configs/globalPageShortcuts'

export function App() {
  const Routes = useRoutes(routes)
  const navigate = useNavigate()
  const shortcuts = useAllRegisteredKeyboardShortcuts()
  createEffect(() =>
    shortcuts().forEach((shortcut) => {
      console.log('23333: ', 23333)
      console.log('registered shortcut: ', shortcut)
    })
  )
  // TODO: not readable
  // should useKeyboardShortcut return localRegisterer and globalRegisterer and allRegistedKeybordShorts
  useKeyboardGlobalShortcut(
    map(
      globalPageShortcuts,
      ({ to }) =>
        () =>
          navigate(to)
    )
  )

  // sdf.forEach((i) => console.log('i: ', i))
  return <Routes />
}
