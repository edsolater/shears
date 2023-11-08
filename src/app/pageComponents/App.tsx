import { capitalize, map } from '@edsolater/fnkit'
import { useLocation, useNavigate, useRoutes } from '@solidjs/router'
import { createEffect, createMemo, onMount } from 'solid-js'
import { switchCase } from '../../packages/fnkit'
import {
  Box,
  Input,
  KeybordShortcutKeys,
  List,
  Text,
  UIKitThemeConfig,
  configUIKitTheme,
  createIncresingAccessor,
  cssColors,
  keyboardShortcutObserverPlugin,
  useKeyboardGlobalShortcut,
} from '../../packages/pivkit'
import { globalPageShortcuts } from '../configs/globalPageShortcuts'
import { useAppThemeMode } from '../hooks/useAppThemeMode'
import { needAppPageLayout, routes } from '../routes'
import { AppPageLayout } from './AppPageLayout'

const uikitConfig: UIKitThemeConfig = {
  Button: {
    icss: {
      color: 'dodgerblue',
    },
  },
}

// config uikit theme before render
configUIKitTheme(uikitConfig)

export function App() {
  useAppThemeMode({ mode: 'dark' })
  const Routes = useRoutes(routes)
  const navigate = useNavigate()
  const location = useLocation()

  const settings = map(globalPageShortcuts, ({ to, shortcut }) => ({
    fn: () => navigate(to),
    shortcut,
  }))
  useKeyboardGlobalShortcut(settings)
  const title = createMemo(() =>
    switchCase(location.pathname, { '/': 'Home' }, (pathname) => pathname.split('/').map(capitalize).join(' ')),
  )
  const needLayout = () => needAppPageLayout[location.pathname]

  return (
    <>
      {needLayout() ? (
        <>
          <KeyboardShortcutPanel />
          <AppPageLayout metaTitle={title()}>
            <Routes />
          </AppPageLayout>
        </>
      ) : (
        <Routes />
      )}
    </>
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
                },
              })}
            />
          </Box>
        )}
      </List>
    </Box>
  )
}
