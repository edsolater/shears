import { capitalize, map, switchCase } from '@edsolater/fnkit'
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
  cssVar,
  icssClickable,
  icssFrostedGlass,
  icssTextColor,
  keyboardShortcutObserverPlugin,
  useKeyboardGlobalShortcut,
} from '@edsolater/pivkit'
import { RouteSectionProps, useNavigate } from '@solidjs/router'
import { createMemo } from 'solid-js'
import { createBranchStore } from '../../packages/conveyor/smartStore/branch'
import { setShuckVisiableChecker } from '../../packages/conveyor/smartStore/shuck'
import { createTask } from '../../packages/conveyor/smartStore/task'
import { createLeafFromAccessor } from '../../packages/conveyor/solidjsAdapter/utils'
import { globalPageShortcuts } from '../configs/globalPageShortcuts'
import { useAppThemeMode } from '../hooks/useAppThemeMode'
import { AppPageLayout } from '../pageComponents/AppPageLayout'
import { routes } from '../routes'
import { store } from '../stores/data/store'

const uikitConfig: UIKitThemeConfig = {
  Button: {
    icss: [icssFrostedGlass, icssTextColor({ color: cssVar('--ternary') }), icssClickable],
  },
}

// config uikit theme before render
configUIKitTheme(uikitConfig)

export function App(props: RouteSectionProps) {
  useAppThemeMode({ mode: 'dark' })
  const navigate = useNavigate()
  const location = props.location

  const settings = map(globalPageShortcuts, ({ to, shortcut }) => ({
    fn: () => navigate(to),
    keyboardShortcut: shortcut,
  }))
  useKeyboardGlobalShortcut(settings)
  const title = createMemo(() =>
    switchCase(location.pathname, { '/': 'Home' }, (pathname) => pathname.split('/').map(capitalize).join(' ')),
  )
  const needLayout = () => routes.find(({ path }) => path === location.pathname)?.needAppPageLayout

  useExperimentalCode()

  return (
    <>
      {needLayout() ? (
        <>
          <KeyboardShortcutPanel />
          <AppPageLayout metaTitle={title()}>{props.children}</AppPageLayout>
        </>
      ) : (
        props.children
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
    setNewSettings((s) => ({ ...s, [description]: { ...s[description], keyboardShortcut: shortcut } }))
  }

  const increasing = createIncresingAccessor({ eachTime: 2000 })
  return (
    <Box icss={{ position: 'fixed', bottom: 0, right: 0, border: 'solid', padding: '4px' }}>
      <List items={globalShortcutsArray}>
        {([description, rule]) => (
          <Box icss={{ display: 'grid', gridTemplateColumns: '180px 200px', gap: '8px' }}>
            <Text icss={cssColors.labelColor}>{description}</Text>
            <Input
              value={String(rule.keyboardShortcut)}
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

const rpcUrlTaskAtom = createLeafFromAccessor(() => store.rpc?.url, { visiable: true })

/** code for test */
function useExperimentalCode() {
  let effectRunCount = 0
  const { branchStore } = createBranchStore({ testCount: 1 })
  const testCount = branchStore.testCount()
  const effect = createTask([testCount], () => {
    effectRunCount++
  })
  effect.run()
  testCount.set((n) => n + 1)
  setShuckVisiableChecker(testCount, true, undefined)
  testCount.set((n) => n + 1)
  setTimeout(() => {
    console.log('effectRunCount: ', effectRunCount)
  })
}
