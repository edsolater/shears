import {
  Box,
  Fragnment,
  Item,
  KitProps,
  Main,
  cssLinearGradient,
  cssVar,
  icssCol,
  icssGrid,
  useKitProps,
} from "@edsolater/pivkit"
import { createEffect, createSignal, onCleanup } from "solid-js"
import type { AppKeeperProps } from "."
import { useMetaTitle } from "../../hooks/useDocumentMetaTitle"
import { TopBarManager } from "./NavBar/TopBarManager"
import { AppKeeperPanelManager } from "./SideMenu/SideMenuManager"

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
export function AppKeeper_LayoutBox(kitProps: KitProps<AppKeeperProps>) {
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

      <AppKeeperPanelManager
        panelName="top-bar"
        icss={{ gridArea: "top" }}
        toggleShortcut={props.topbarShortcut ?? "alt + '"}
        canFloating={props.topbarCanFloating}
        changeToFloatingShortcut={props.topbarFloatingShortcut ?? "shift + alt + '"}
        defaultOpen
        canHeightResized
        initHeight={80}
        canWidthResized={false}
      >
        {props["Topbar"]}
      </AppKeeperPanelManager>

      <AppKeeperPanelManager
        panelName="side-menu"
        icss={{ gridArea: "side" }}
        toggleShortcut={props.sidebarShortcut ?? "alt + \\"}
        canFloating={props.sidebarCanFloating}
        changeToFloatingShortcut={props.sidebarFloatingShortcut ?? "shift + alt + \\"}
        defaultOpen
        canWidthResized
        initWidth={300}
        canHeightResized={false}
      >
        {props["Sidebar"]}
      </AppKeeperPanelManager>

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
