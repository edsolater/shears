import { map } from '@edsolater/fnkit'
import { useNavigate, useRoutes } from '@solidjs/router'
import { createEffect, createMemo, createSignal } from 'solid-js'
import { Piv } from '../../../packages/piv'
import { Box, List, Text } from '../../../packages/pivkit'
import {
  useAllRegisteredGlobalShortcuts,
  useKeyboardGlobalShortcut
} from '../../../packages/pivkit/features/useKeyboardShortcut'
import { cssColors } from '../../../packages/pivkit/styles/cssColors'
import { globalPageShortcuts } from '../configs/globalPageShortcuts'
import { routes } from '../configs/routes'
import '../styles/index.css'
import { Input } from '../../../packages/pivkit/components/Input'
import { createIncresingAccessor } from '../../../packages/pivkit/hooks/createIncreasingAccessor'

export function App() {
  const Routes = useRoutes(routes)
  const navigate = useNavigate()

  const settings = map(globalPageShortcuts, ({ to }) => ({
    fn: () => navigate(to),
    description: `go to ${to}`
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
  const globalShortcutsArray = createMemo(() => {
    const shortcuts = globalShortcuts()
    return shortcuts && Object.entries(shortcuts)
  })
  const increasing = createIncresingAccessor()
  return (
    <Box icss={{ position: 'fixed', bottom: 0, right: 0, border: 'solid', padding: '4px' }}>
      <List items={globalShortcutsArray}>
        {([key, rule]) => (
          <Box icss={{ display: 'grid', gridTemplateColumns: '180px 200px', gap: '8px' }}>
            <Text icss={cssColors.labelColor}>{rule?.description}</Text>
            <Input
              value={key + increasing()}
              icss={{ border: 'solid' }}
              onUserInput={(utils) => {
                console.log('utils.: ', utils.text)
              }}
            />
          </Box>
        )}
      </List>
    </Box>
  )
}
