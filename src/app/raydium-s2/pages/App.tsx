import { map } from '@edsolater/fnkit'
import { useNavigate, useRoutes } from '@solidjs/router'
import { createMemo } from 'solid-js'
import { KeybordShortcutKeys } from '../../../packages/domkit/gesture/handleKeyboardShortcut'
import { Piv } from '../../../packages/piv'
import { Box, List, Text } from '../../../packages/pivkit'
import { Input } from '../../../packages/pivkit/components/Input'
import { keyboardShortcutObserverPlugin } from '../../../packages/pivkit/components/Input/plugins/shortcutInputPlugin'
import { useKeyboardGlobalShortcut } from '../../../packages/pivkit/features/useKeyboardShortcut'
import { createIncresingAccessor } from '../../../packages/pivkit/hooks/createIncreasingAccessor'
import { cssColors } from '../../../packages/pivkit/styles/cssColors'
import { globalPageShortcuts } from '../configs/globalPageShortcuts'
import { routes } from '../configs/routes'
import '../styles/index.css'

export function App() {
  const Routes = useRoutes(routes)
  const navigate = useNavigate()

  const settings = map(globalPageShortcuts, ({ to, shortcut }) => ({
    fn: () => navigate(to),
    shortcut
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
  const { registeredGlobalShortcuts: globalShortcuts, setNewSettings } = useKeyboardGlobalShortcut()
  const globalShortcutsArray = createMemo(() => {
    const shortcuts = globalShortcuts()
    return shortcuts && Object.entries(shortcuts)
  })

  // utils for update shortcut
  const updateSetting = (description: string, shortcut: KeybordShortcutKeys) => {
    setNewSettings((s) => ({ ...s, [description]: { ...s[description], shortcut } }))
  }

  const increasing = createIncresingAccessor({ eachTime: 2000 })
  return (
    <Box icss={{ position: 'fixed', bottom: 0, right: 0, border: 'solid', padding: '4px' }}>
      <List items={globalShortcutsArray}>
        {([description, rule]) => (
          <Box icss={{ display: 'grid', gridTemplateColumns: '180px 200px', gap: '8px' }}>
            <Text icss={cssColors.labelColor}>{description}</Text>
            <Input
              value={rule.shortcut}
              icss={{ border: 'solid' }}
              disableUserInput
              plugin={keyboardShortcutObserverPlugin({
                onRecordShortcut(newShortcut) {
                  updateSetting(description, newShortcut)
                }
              })}
            />
          </Box>
        )}
      </List>
    </Box>
  )
}
