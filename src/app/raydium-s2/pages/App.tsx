import { useNavigate, useRoutes } from '@solidjs/router'
import { createEffect } from 'solid-js'
import type {
  KeyboardShortcutSetting,
  KeybordShortcutKeys
} from '../../../packages/domkit/gesture/handleKeyboardShortcut'
import { Piv } from '../../../packages/piv'
import { List, Text } from '../../../packages/pivkit'
import {
  useAllRegisteredGlobalShortcuts,
  useKeyboardGlobalShortcut
} from '../../../packages/pivkit/features/useKeyboardShortcut'
import { globalPageShortcuts } from '../configs/globalPageShortcuts'
import { routes } from '../configs/routes'
import '../styles/index.css'
import { cssColors } from '../../../packages/pivkit/styles/cssColors'

export function App() {
  const Routes = useRoutes(routes)
  const navigate = useNavigate()

  const settings: KeyboardShortcutSetting[] = Object.entries(globalPageShortcuts).map(([key, { to }]) => ({
    fn: () => navigate(to),
    description: `navigate to ${to}`,
    key: key as KeybordShortcutKeys
  }))
  useKeyboardGlobalShortcut(settings)

  return (
    <Piv>
      <KeyboardShortcutPanel />
      <Routes />
    </Piv>
  )
}

function KeyboardShortcutPanel() {
  const globalShortcuts = useAllRegisteredGlobalShortcuts()
  createEffect(() => console.log('globalShortcuts(): ', globalShortcuts()))
  return (
    <Piv icss={{ position: 'fixed', bottom: 0, right: 0, border: 'solid', padding: '4px' }}>
      <List items={globalShortcuts}>
        {(rule) => (
          <Piv icss={{ display: 'grid', gridTemplateColumns: '180px 200px', gap: '8px' }}>
            <Text icss={cssColors.labelColor}>{rule.description}</Text>
            <Text>{rule.key}</Text>
          </Piv>
        )}
      </List>
    </Piv>
  )
}
