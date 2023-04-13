import { map } from '@edsolater/fnkit'
import { useNavigate, useRoutes } from '@solidjs/router'
import { useKeyboardShortcutRegisterers } from '../../../packages/pivkit/features/useKeyboardShortcut'
import { globalPageShortcuts } from '../configs/globalPageShortcuts'
import { routes } from '../configs/routes'
import '../styles/index.css'
import { Piv } from '../../../packages/piv'
import { createEffect } from 'solid-js'

export function App() {
  const Routes = useRoutes(routes)
  const navigate = useNavigate()
  const keyboardShortcutRegisterers = useKeyboardShortcutRegisterers()

  keyboardShortcutRegisterers.registerGlobal(
    map(
      globalPageShortcuts,
      ({ to }) =>
        () =>
          navigate(to)
    )
  )

  const allShortcuts = keyboardShortcutRegisterers.getAllRegistereds()

  createEffect(() => allShortcuts().forEach((shortcut) => console.log('shortcut: ', shortcut)))
  return (
    <Piv>
      <Routes />
    </Piv>
  )
}
