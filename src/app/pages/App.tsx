import { capitalize, map, switchCase } from "@edsolater/fnkit"
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
  useShortcutsInfo,
  useShortcutsRegister,
} from "@edsolater/pivkit"
import { RouteSectionProps, useNavigate } from "@solidjs/router"
import { createMemo } from "solid-js"
import { createBranchStore } from "../../packages/conveyor/smartStore/branch"
import { setShuckVisiableChecker } from "../../packages/conveyor/smartStore/shuck"
import { createTask } from "../../packages/conveyor/smartStore/task"
import { globalRouteShortcuts } from "../configs/globalShortcuts"
import { routes } from "../configs/routes"
import { initAppContextConfig } from "../hooks/initAppContextConfig"
import { AppPageLayout } from "../pageComponents/AppPageLayout"
import { documentElement } from "../utils/documentElement"

const uikitConfig: UIKitThemeConfig = {
  Button: {
    icss: [icssFrostedGlass, icssTextColor({ color: cssVar("--ternary") }), icssClickable],
  },
}

// config uikit theme before render
configUIKitTheme(uikitConfig)
initAppContextConfig({ themeMode: "dark", onlyAltSelect: true })

export function App(props: RouteSectionProps) {
  const location = props.location
  const title = createMemo(() =>
    switchCase(location.pathname, { "/": "Home" }, (pathname) => pathname.split("/").map(capitalize).join(" ")),
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
  const navigate = useNavigate()
  const { shortcuts } = useShortcutsInfo(documentElement)
  useShortcutsRegister(
    documentElement,
    map(globalRouteShortcuts, ({ to, shortcut }) => ({
      shortcut,
      fn: () => navigate(to),
    })),
  )

  // utils for update shortcut
  const updateSetting = (description: string, shortcut: KeybordShortcutKeys) => {
    // setSettings((s) => ({ ...s, [description]: { ...s[description], keyboardShortcut: shortcut } }))
  }
  const increasing = createIncresingAccessor({ eachTime: 2000 })
  return (
    <Box
      icss={{
        position: "fixed",
        bottom: 0,
        right: 0,
        border: "solid",
        padding: "4px",
        zIndex: 10,
        contain: "content",
        backdropFilter: "blur(2px) brightness(0.2)",
      }}
    >
      <List items={shortcuts}>
        {(shortcutItem) => (
          <Box icss={{ display: "grid", gridTemplateColumns: "180px 200px", gap: "8px" }}>
            <Text icss={cssColors.labelColor}>{shortcutItem.description}</Text>
            <Input
              value={String(shortcutItem.shortcut)}
              icss={{ border: "solid" }}
              disableUserInput
              plugin={keyboardShortcutObserverPlugin({
                onRecordShortcut(newShortcut) {
                  updateSetting(shortcutItem.description, newShortcut)
                },
              })}
            />
          </Box>
        )}
      </List>
    </Box>
  )
}

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
    console.log("effectRunCount: ", effectRunCount)
  })
}
