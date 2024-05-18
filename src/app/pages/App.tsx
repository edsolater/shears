import { capitalize, switchCase } from "@edsolater/fnkit"
import {
  UIKitThemeConfig,
  configUIKitTheme,
  cssVar,
  icssClickable,
  icssFrostedGlass,
  icssTextColor,
} from "@edsolater/pivkit"
import { RouteSectionProps } from "@solidjs/router"
import { createEffect, createMemo, onCleanup, onMount } from "solid-js"
import { useStorageValue } from "../../packages/cacheManager/hook"
import { createBranchStore } from "../../packages/conveyor/smartStore/branch"
import { setShuckVisiableChecker } from "../../packages/conveyor/smartStore/shuck"
import { createTask } from "../../packages/conveyor/smartStore/task"
import { routes } from "../configs/routes"
import { initAppContextConfig } from "../hooks/initAppContextConfig"
import { AppKeeper } from "../pageComponents/AppKeeper"
import { NavBar } from "../pageComponents/AppKeeper/NavBar"
import { SideMenu } from "../pageComponents/AppKeeper/SideMenu"
import { KeyboardShortcutPanel } from "../pageComponents/KeyboardShortcutPanel"
import { ShuckInspectorPanel } from "../pageComponents/ShuckInspectorPanel"
import { setStore, shuck_rpc } from "../stores/data/store"

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
  const needLayout = () => routes.find(({ path }) => path === location.pathname)?.needAppKeeper
  useExperimentalCode()
  useLocalStorageRpc()
  return (
    <>
      {needLayout() ? (
        <>
          <AppKeeper
            metaTitle={title()}
            Topbar={<NavBar />}
            Sidebar={<SideMenu />}
            FABs={[<KeyboardShortcutPanel />, <ShuckInspectorPanel />]}
          >
            {props.children}
          </AppKeeper>
        </>
      ) : (
        props.children
      )}
    </>
  )
}

/**
 * init rpcs from localStorage
 */
function useLocalStorageRpc() {
  const [localStorageRpcs, setlocalStorageRpcs] = useStorageValue({ key: "rpcs" })
  const rpcs = createMemo(() => localStorageRpcs()?.split(","))
  const firstUrl = createMemo(() => rpcs()?.at(0))
  createEffect(() => {
    const url = firstUrl()
    if (url) {
      setStore({ rpc: { url } })
      shuck_rpc.set({ url })
    }
  })
  onMount(() => {
    const { unsubscribe } = shuck_rpc.subscribe((rpc) => {
      if (!rpc) return
      if (rpcs()?.includes(rpc.url)) return
      setlocalStorageRpcs((rpcs) => (rpcs ? rpcs + "," + rpc.url : rpc.url))
    })
    onCleanup(unsubscribe)
  })
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
