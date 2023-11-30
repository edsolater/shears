import { capitalize, map, switchCase } from '@edsolater/fnkit'
import { useLocation, useNavigate, useRoutes } from '@solidjs/router'
import { createMemo } from 'solid-js'
import { createBranchStore } from '../../packages/conveyor/smartStore/createBranch'
import { createLeafFromAccessor } from '../../packages/conveyor/solidjsAdapter/utils'
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
  icss_clickable,
  icss_frostedGlass,
  icss_textColor,
  keyboardShortcutObserverPlugin,
  useKeyboardGlobalShortcut,
} from '../../packages/pivkit'
import { globalPageShortcuts } from '../configs/globalPageShortcuts'
import { useAppThemeMode } from '../hooks/useAppThemeMode'
import { needAppPageLayout, routes } from '../routes'
import { store } from '../stores/data/store'
import { AppPageLayout } from './AppPageLayout'
import { createTask } from '../../packages/conveyor/smartStore/createTask'
import { setLeafVisiable } from '../../packages/conveyor/smartStore/createLeaf'

const uikitConfig: UIKitThemeConfig = {
  Button: {
    icss: [icss_frostedGlass, icss_textColor({ color: cssVar('--ternary') }), icss_clickable],
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

  useExperimentalCode()

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

const rpcUrlTaskAtom = createLeafFromAccessor(() => store.rpc?.url, { visiable: true })

/** code for test */
function useExperimentalCode() {
  // let effectRunCount = 0
  // const { store } = createBranchStore({ testCount: 1 })
  // const effect = createTask([store.testCount], (get) => {
  //   const n = get(store.testCount)
  //   effectRunCount++
  // })
  // effect.register()
  // store.testCount.set((n) => n + 1)
  // store.testCount.set((n) => n + 1)
  // store.testCount.set((n) => n + 1)
  // console.log('🧪🧪🧪🧪 before visiable')
  // setLeafVisiable(store.testCount, true)
  // console.log('🧪🧪🧪🧪 after visiable')
  // const v = store.testCount.subscribedExecutors
  // console.log('v: ', v)
  // store.testCount.set((n) => n + 1)
  // console.log('effectRunCount after visiable 0: ', effectRunCount) // task still not be invoked
  // setTimeout(() => {
  //   console.log('effectRunCount after visiable 1 : ', effectRunCount) // task has been invoked
  // })
}
