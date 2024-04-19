import { capitalize, map, switchCase } from "@edsolater/fnkit"
import {
  Box,
  InfiniteScrollList,
  Input,
  KeybordShortcutKeys,
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
import { createEffect, createMemo, on } from "solid-js"
import { createBranchStore } from "../../packages/conveyor/smartStore/branch"
import { setShuckVisiableChecker } from "../../packages/conveyor/smartStore/shuck"
import { createTask } from "../../packages/conveyor/smartStore/task"
import { globalRouteShortcuts } from "../configs/globalShortcuts"
import { routes } from "../configs/routes"
import { initAppContextConfig } from "../hooks/initAppContextConfig"
import { AppManager } from "../pageComponents/AppManager"
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
  const needLayout = () => routes.find(({ path }) => path === location.pathname)?.needAppManager
  useExperimentalCode()
  return (
    <>
      {needLayout() ? (
        <>
          <KeyboardShortcutPanel />
          <AppManager metaTitle={title()}>{props.children}</AppManager>
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
  const { updateShortcut } = useShortcutsRegister(
    documentElement,
    map(globalRouteShortcuts, ({ to, shortcut }) => ({
      shortcut,
      fn: () => navigate(to),
    })),
  )

  // utils for update shortcut
  const updateSetting = (description: string, shortcut: KeybordShortcutKeys) => {
    updateShortcut(description, { shortcut })
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
      <InfiniteScrollList items={shortcuts()}>
        {({ description, shortcut }) => (
          <Box icss={{ display: "grid", gridTemplateColumns: "180px 200px", gap: "8px" }}>
            <Text icss={cssColors.labelColor}>{description}</Text>
            <Input
              value={String(shortcut)}
              icss={{ border: "solid" }}
              disableUserInput
              plugin={keyboardShortcutObserverPlugin({
                onRecordShortcut({ shortcut: newShortcut, el }) {
                  if (newShortcut !== shortcut) {
                    updateSetting(description, newShortcut)
                  }
                },
              })}
            />
          </Box>
        )}
      </InfiniteScrollList>
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
