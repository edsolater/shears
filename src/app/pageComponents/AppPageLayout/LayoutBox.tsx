import type { MayArray } from "@edsolater/fnkit"
import {
  Box,
  Fragnment,
  KitProps,
  Main,
  PivChild,
  createDisclosure,
  cssLinearGradient,
  cssVar,
  icssCol,
  icssGrid,
  renderAsHTMLAside,
  useComponentContext,
  useKitProps,
  useShortcutsRegister,
  type KeybordShortcutKeys,
} from "@edsolater/pivkit"
import { createEffect, createSignal, onCleanup } from "solid-js"
import { AppPageLayoutContext } from "."
import { Item } from "../../../packages/pivkit"
import { useMetaTitle } from "../../hooks/useDocumentMetaTitle"
import { documentElement } from "../../utils/documentElement"

export type AppPageLayout_LayoutBoxProps = {
  metaTitle?: string

  "render:contentBanner"?: PivChild
  "TopbarBanner"?: PivChild
  "Topbar"?: PivChild
  Sidebar?: PivChild
  sidebarShortcut?: MayArray<KeybordShortcutKeys>
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
export function AppPageLayout_LayoutBox(kitProps: KitProps<AppPageLayout_LayoutBoxProps>) {
  const { props } = useKitProps(kitProps, { defaultProps: { sidebarShortcut: "alt + w" } })
  useMetaTitle(props.metaTitle)
  const [layoutContext, setLayoutContext] = useComponentContext(AppPageLayoutContext)
  const [isSideMenuOpen, { set, toggle }] = createDisclosure()
  setLayoutContext({ isSideMenuOpen: isSideMenuOpen })

  useShortcutsRegister(documentElement, {
    "Toggle Side Menu": {
      shortcut: props.sidebarShortcut,
      fn: () => {
        toggle()
      },
    },
  })

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

      <Item
        name={"side-menu"}
        icss={{
          width: isSideMenuOpen() ? "clamp(40px, 30vw, 400px)" : "0vw",
          overflow: "hidden",
          gridArea: "side",
          transition: "500ms",
          containerType: "size",
        }}
        render:self={renderAsHTMLAside}
      >
        {props["Sidebar"]}
      </Item>

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
