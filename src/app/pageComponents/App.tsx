import { capitalize, isObject, map, switchCase } from '@edsolater/fnkit'
import { useLocation, useNavigate, useRoutes } from '@solidjs/router'
import { createMemo } from 'solid-js'
import { Shuck, createShuck } from '../../packages/conveyor/smartStore/createShuck'
import { createFakeTree } from '../../packages/conveyor/smartStore/fakeTree'
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
    b?: {
      c: string
    }
    d?: { say?: string; hello?: string }
  }

  // too difficult to type
  // type FakeTreeify<T> = T extends object ? { [K in keyof T]: FakeTreeify<T[K]> } : () => Leaf<T>

  const { rawObj, tree, set } = createFakeTree<OriginalObj>(
    { a: 1 },
    {
      createLeaf: (rawValue) => createShuck(rawValue),
      injectValueToExistLeaf: (leaf, val) =>
        (leaf as Shuck<any>).set((p) => (isObject(val) && isObject(p) ? { ...p, ...val } : val)),
    },
  )
  console.log('tree.a: ', tree.a)
  console.log('treeRoot.a: ', tree.a()())
  console.log('treeRoot.d 0:  ', tree.d()())
  set({ d: { hello: 'world' } })
  console.log('treeRoot.d: ', tree.d()())
  set({ d: { say: 'hello' } })
  console.log('treeRoot.d:  ', tree.d()())
}
