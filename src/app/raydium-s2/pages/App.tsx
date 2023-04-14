import { map } from '@edsolater/fnkit'
import { useNavigate, useRoutes } from '@solidjs/router'
import { createEffect, createMemo } from 'solid-js'
import { Piv } from '../../../packages/piv'
import { keyboardShortcutUtils } from '../../../packages/pivkit/features/useKeyboardShortcut'
import { globalPageShortcuts } from '../configs/globalPageShortcuts'
import { routes } from '../configs/routes'
import '../styles/index.css'
import { List } from '../../../packages/pivkit'

export function App() {
  const Routes = useRoutes(routes)
  const navigate = useNavigate()

  keyboardShortcutUtils.registerGlobal(
    map(
      globalPageShortcuts,
      ({ to }) =>
        () =>
          navigate(to)
    )
  )

  const allShortcuts = keyboardShortcutUtils.getAllRegistereds()

  createEffect(() => allShortcuts().forEach((shortcut) => console.log('shortcut: ', shortcut)))
  return (
    <Piv>
      <KeyboardShortcutPanel />
      <Routes />
    </Piv>
  )
}

function KeyboardShortcutPanel() {
  const allShortcuts = keyboardShortcutUtils.getAllRegistereds()
  const globalShortcuts = createMemo(() =>
    [...allShortcuts().values()]
      .filter((i) => i.bindLevel === 'global')
      .map((i) => i.settings)
      .flatMap((setting) => Object.entries(setting).map(([key, shortcutFn]) => ({ key, shortcutFn })))
  )
  return (
    <Piv icss={{ position: 'fixed', bottom: 0, right: 0, border: 'solid', padding:'4px' }}>
      <List items={globalShortcuts}>{(settings) => <Piv>{settings.key}</Piv>}</List>
    </Piv>
  )
}
