import { capitalize, isObject, isUndefined, map, switchCase } from "@edsolater/fnkit"
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
import { Show, createEffect, createMemo, on, onCleanup, onMount } from "solid-js"
import { createBranchStore } from "../../packages/conveyor/smartStore/branch"
import { setShuckVisiableChecker } from "../../packages/conveyor/smartStore/shuck"
import { createTask } from "../../packages/conveyor/smartStore/task"
import { globalRouteShortcuts } from "../configs/globalShortcuts"
import { routes } from "../configs/routes"
import { initAppContextConfig } from "../hooks/initAppContextConfig"
import { AppKeeper } from "../pageComponents/AppKeeper"
import { documentElement } from "../utils/documentElement"
import { useStorageValue } from "../../packages/cacheManager/hook"
import {
  setStore,
  shuck_balances,
  shuck_clmmInfos,
  shuck_isClmmJsonInfoLoading,
  shuck_isMobile,
  shuck_isTokenAccountsLoading,
  shuck_isTokenListLoading,
  shuck_isTokenListLoadingError,
  shuck_isTokenPricesLoading,
  shuck_owner,
  shuck_rpc,
  shuck_slippage,
  shuck_tokenAccounts,
  shuck_tokenPrices,
  shuck_tokens,
  shuck_walletAdapter,
  shuck_walletConnected,
} from "../stores/data/store"
import { useShuckValue } from "../../packages/conveyor/solidjsAdapter/useShuck"

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
          <KeyboardShortcutPanel />
          <AppKeeper metaTitle={title()}>{props.children}</AppKeeper>
          <ShuckInspectorPanel />
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

/**
 *
 * COMPONENT
 * show current page valiable shortcut
 */
function KeyboardShortcutPanel() {
  const navigate = useNavigate()
  const { shortcuts } = useShortcutsInfo(documentElement)
  const { updateShortcut } = useShortcutsRegister(
    documentElement,
    map(globalRouteShortcuts, ({ to, shortcut }) => ({
      shortcut,
      action: () => navigate(to),
    })),
  )

  // utils for update shortcut
  const updateSetting = (description: string, shortcut: KeybordShortcutKeys) => {
    updateShortcut(description, { shortcut })
  }
  const increasing = createIncresingAccessor({ eachTime: 2000 })
  return (
    <Box
      class={"keyboard-shortcut-panel"}
      icss={{
        //TODO: should be on by keyboard , temporary just hidden it!!
        visibility: "hidden",
        pointerEvents: "none",

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

/**
 *
 * COMPONENT
 * show current page valiable shortcut
 */
function ShuckInspectorPanel() {
  const isTokenPricesLoading = useShuckValue(shuck_isTokenPricesLoading)
  const tokenPrices = useShuckValue(shuck_tokenPrices)
  const isTokenListLoading = useShuckValue(shuck_isTokenListLoading)
  const isTokenListLoadingError = useShuckValue(shuck_isTokenListLoadingError)
  const tokens = useShuckValue(shuck_tokens)
  const isTokenAccountsLoading = useShuckValue(shuck_isTokenAccountsLoading)
  const tokenAccounts = useShuckValue(shuck_tokenAccounts)
  const balances = useShuckValue(shuck_balances)
  const walletAdapter = useShuckValue(shuck_walletAdapter)
  const walletConnected = useShuckValue(shuck_walletConnected)
  const owner = useShuckValue(shuck_owner)
  const rpc = useShuckValue(shuck_rpc)
  const isMobile = useShuckValue(shuck_isMobile)
  const slippage = useShuckValue(shuck_slippage)
  const isClmmJsonInfoLoading = useShuckValue(shuck_isClmmJsonInfoLoading)
  const clmmInfos = useShuckValue(shuck_clmmInfos)

  const allShucks = {
    isTokenPricesLoading,
    tokenPrices,
    isTokenListLoading,
    isTokenListLoadingError,
    tokens,
    isTokenAccountsLoading,
    tokenAccounts,
    balances,
    walletAdapter,
    walletConnected,
    owner,
    rpc,
    isMobile,
    slippage,
    isClmmJsonInfoLoading,
    clmmInfos,
  }
  return (
    <Box
      class={"keyboard-shortcut-panel"}
      icss={{
        //TODO: should be on by keyboard , temporary just hidden it!!
        visibility: "hidden",
        pointerEvents: "none",

        position: "fixed",
        bottom: "50vh",
        right: 0,
        border: "solid",
        padding: "4px",
        zIndex: 10,
        contain: "content",
        backdropFilter: "blur(2px) brightness(0.2)",
      }}
    >
      <InfiniteScrollList items={allShucks}>
        {(value, name) => (
          <Box icss={{ display: "grid", gridTemplateColumns: "180px 200px", gap: "8px" }}>
            <Text icss={cssColors.labelColor}>{name}</Text>
            <Text>
              {isObject(value()) ? Object.keys(value()!).length : isUndefined(value()) ? null : String(value())}
            </Text>
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
