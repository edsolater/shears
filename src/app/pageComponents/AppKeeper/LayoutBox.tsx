import type { MayArray } from "@edsolater/fnkit"
import {
  Box,
  Fragnment,
  Item,
  KitProps,
  Main,
  Piv,
  PivChild,
  createDisclosure,
  createDomRef,
  cssLinearGradient,
  cssVar,
  icssCol,
  icssGrid,
  renderAsHTMLAside,
  resizablePlugin,
  useComponentContext,
  useKitProps,
  usePlugin,
  useShortcutsRegister,
  type KeybordShortcutKeys,
} from "@edsolater/pivkit"
import { createEffect, createSignal, onCleanup } from "solid-js"
import { AppKeeperContext } from "."
import { useLocalStorageValue } from "../../../packages/cacheManager/hook"
import { useMetaTitle } from "../../hooks/useDocumentMetaTitle"
import { colors } from "../../theme/colors"
import { documentElement } from "../../utils/documentElement"
import { renderAsHTMLDiv } from "@edsolater/pivkit"

export type AppKeeper_LayoutBoxProps = {
  metaTitle?: string

  "render:contentBanner"?: PivChild
  TopbarBanner?: PivChild
  Topbar?: PivChild

  Sidebar?: PivChild
  sidebarShortcut?: MayArray<KeybordShortcutKeys>
  // feature:
  sidebarCanFloating?: boolean
  sidebarFloatingShortcut?: MayArray<KeybordShortcutKeys>

  Content?: PivChild
}

// should feature build-in pivkit's createDisclousure
function createIntervalSignal(rawOptions?: { run?: boolean; intervalDelay?: number; default?: boolean }) {
  const { run = true, intervalDelay = 1000, default: init = false } = rawOptions ?? {}
  const [flag, setFlag] = createSignal(init)
  createEffect(() => {
    if (!run) return
    const intervalId = setInterval(() => {
      setFlag((b) => !b)
    }, intervalDelay)
    onCleanup(() => {
      clearInterval(intervalId)
    })
  })
  return flag
}
/**
 * for easier to code and read
 *
 * TEMP: add haveData to fix scrolling bug
 */
export function AppKeeper_LayoutBox(kitProps: KitProps<AppKeeper_LayoutBoxProps>) {
  const { props } = useKitProps(kitProps)
  useMetaTitle(props.metaTitle)
  // const isSideMenuOpen = createIntervalSignal({ intervalDelay: 3000, default: true, run: false })
  return (
    <Box
      icss={{
        position: "relative",
        width: "100%",
        height: "100%",
        padding:
          "env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)",
        display: "grid",
        gridTemplate: `
          "ban  ban    " auto
          "top  top    " auto
          "side content" 1fr / auto 1fr`,
        overflow: "hidden",
        willChange: "opacity",
      }}
    >
      <Item name={"top-banner"} icss={{ gridArea: "ban" }}>
        {props["TopbarBanner"]}
      </Item>

      <Item name={"top-menu"} icss={{ gridArea: "top" }}>
        {props["Topbar"]}
      </Item>

      <SideMenuManager
        toggleShortcut={props.sidebarShortcut}
        canFloating={props.sidebarCanFloating}
        changeToFloatingShortcut={props.sidebarFloatingShortcut}
        defaultOpen
      >
        {props["Sidebar"]}
      </SideMenuManager>

      <Item name={"content"} icss={[{ gridArea: "content" }, icssGrid]}>
        <Main
          icss={[
            icssCol,
            { position: "relative", overflow: "hidden" },
            {
              background: cssLinearGradient({ colors: [cssVar("--content-bg__01"), cssVar("--content-bg__02")] }),
              borderTopLeftRadius: "20px",
            },
          ]}
        >
          <Fragnment>{props["render:contentBanner"]}</Fragnment>
          <Box
            icss={[
              icssCol({ childItems: "none" }),
              {
                flexGrow: 1,
                height: 0,
                isolation: "isolate",
                padding: "24px",
                display: "grid",
                gridAutoFlow: "column",
                overflowY: "scroll",
                overflowX: "hidden",
              },
            ]}
          >
            {props.children}
          </Box>
        </Main>
      </Item>
    </Box>
  )
}

/** always render */
function SideMenuManager(
  kitprops: KitProps<{
    children?: PivChild
    toggleShortcut?: MayArray<KeybordShortcutKeys>
    canFloating?: boolean
    changeToFloatingShortcut?: MayArray<KeybordShortcutKeys>
    defaultOpen?: boolean
    defaultFloating?: boolean
  }>,
) {
  const { props, shadowProps } = useKitProps(kitprops, {
    defaultProps: { toggleShortcut: "alt + \\", changeToFloatingShortcut: "shift + alt + \\" },
  })
  const [layoutContext, setLayoutContext] = useComponentContext(AppKeeperContext)
  const [isSideMenuOpen, { toggle: toggleSideMenu }] = createDisclosure(props.defaultOpen)
  const [isSideMenuFloating, { toggle: toggleSideMenuFloating }] = createDisclosure(props.defaultFloating)
  setLayoutContext({ isSideMenuOpen, isSideMenuFloating })
  useShortcutsRegister(documentElement, {
    "Toggle Side Menu": {
      shortcut: props.toggleShortcut,
      fn: () => {
        toggleSideMenu()
      },
    },
    "Sidebar Floating Mode": {
      shortcut: props.changeToFloatingShortcut,
      fn: () => {
        toggleSideMenuFloating()
      },
    },
  })

  const [haveRenderContent, setHaveRenderContent] = createSignal(isSideMenuOpen()) // one-way of isSideMenuOpen
  createEffect(() => {
    if (isSideMenuOpen()) {
      setHaveRenderContent(true)
    }
  })
  const [sideMenuWidth, setSideMenuWidth] = useLocalStorageValue("_side-menu-width", "300")
  const { dom: wrapperDOM, setDom } = createDomRef()
  const { dom: sizePlaceholderDOM, setDom: setSizePlaceholderDOM } = createDomRef()

  const [resizablePluginModule, { resizingHiddenTransactionMask }] = usePlugin(resizablePlugin, {
    onSizeChange({ currentVal }) {
      setSideMenuWidth(currentVal.toFixed(3))
    },
    onResizing({ currentVal }) {
      wrapperDOM()?.style.setProperty("--side-menu-width", `${currentVal}px`)
    },

    canResizeY: false,
    canResizeX: true,
  })
  return (
    <Piv // subcomponent area grid-item
      domRef={[setDom, resizingHiddenTransactionMask]}
      class={"side-menu"}
      shadowProps={shadowProps}
      icss={{
        gridArea: "side",
        width: cssVar("--side-menu-width"),
        // width: isSideMenuOpen() && !isSideMenuFloating() ? cssVar("--side-menu-width") : "0vw",
        transition: "500ms",
      }}
      render:self={renderAsHTMLAside}
      style={() => ({
        "--side-menu-width": `${sideMenuWidth()}px`,
      })}
    >
      <Box // size & position placeholder
        domRef={[setSizePlaceholderDOM, resizingHiddenTransactionMask]}
        icss={{
          width: cssVar("--side-menu-width"),
          position: "relative",
          transform: isSideMenuOpen() ? "translateX(0)" : "translateX(-100%)",
          transition: "500ms",
          height: "100%",
          zIndex: 999,
        }}
        plugin={resizablePluginModule}
        // style={{
        //   border: "solid",
        // }}
      >
        <Box // content holder
          icss={[
            {
              background: colors.sidebarBg,
              position: "absolute",
              containerType: "size",
              transition: "200ms",
            },
            isSideMenuFloating()
              ? {
                  borderRadius: "16px",
                  top: "8px",
                  left: "8px",
                  height: "calc(100% - 16px)",
                  width: `calc(100% - 8px)`,
                  boxShadow: "0 0 16px rgba(0,0,0,0.1)",
                }
              : { left: "0", top: "0", width: "100%", height: "100%" },
          ]}
        >
          {haveRenderContent() ? props.children : null}
        </Box>
      </Box>
    </Piv>
  )
}
