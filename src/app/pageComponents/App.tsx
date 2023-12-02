import { capitalize, map, switchCase } from '@edsolater/fnkit'
import { useLocation, useNavigate, useRoutes } from '@solidjs/router'
import { createMemo } from 'solid-js'
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
import { createFakeTree } from '../../packages/conveyor/smartStore/fakeTree'
import { Leaf, createLeaf } from '../../packages/conveyor/smartStore/createLeaf'

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
  type OriginalObj = {
    a: number
    b: {
      c: string
    }
    d?: boolean | { say: string }
  }
  type FakeTreeify<T> = T extends object ? { [K in keyof T]: FakeTreeify<T[K]> } : Leaf<T>

  const { rawObj, get, set } = createFakeTree<OriginalObj, FakeTreeify<OriginalObj>>(
    { a: 1, b: { c: '2' } },
    {
      createNewLeaf: (rawValue) => createLeaf(rawValue),
      injectValueToExistLeaf: (leaf, val) => (leaf as Leaf<any>).set(val),
    },
  )
  console.log('rawObj.b.c: ', rawObj.b.c)
  console.log('treeRoot.b.c: ', get((s) => s.b.c)())
  console.log(
    'treeRoot.a: ',
    get((s) => s.a),
  )
  set({ d: true })
  console.log('treeRoot.d: ', get((s) => s.d)())
  set({ d: { say: 'hello' } })
  console.log('treeRoot.d.say: ', get((s) => s.d)())
}
