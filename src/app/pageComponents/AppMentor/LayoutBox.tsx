import type { MayArray } from "@edsolater/fnkit"
import {
  Box,
  Fragnment,
  KitProps,
  Main,
  PivChild,
  createDisclosure,
  createDomRef,
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
import { children, createEffect, createSignal, onCleanup } from "solid-js"
import { AppMentorContext } from "."
import { Item } from "../../../packages/pivkit"
import { useMetaTitle } from "../../hooks/useDocumentMetaTitle"
import { documentElement } from "../../utils/documentElement"
import { colors } from "../../theme/colors"

export type AppMentor_LayoutBoxProps = {
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
export function AppMentor_LayoutBox(kitProps: KitProps<AppMentor_LayoutBoxProps>) {
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
  }>,
) {
  const { props, shadowProps } = useKitProps(kitprops, {
    defaultProps: { toggleShortcut: "alt + \\", changeToFloatingShortcut: "shift + alt + \\" },
  })
  const [layoutContext, setLayoutContext] = useComponentContext(AppMentorContext)
  const [isSideMenuOpen, { toggle: toggleSideMenu }] = createDisclosure(false)
  const [isSideMenuFloating, { toggle: toggleSideMenuFloating }] = createDisclosure(true)
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
  createEffect(() => {
    console.log("isSideMenuOpen(): ", isSideMenuOpen())
    console.log("isSideMenuFloating(): ", isSideMenuFloating())
  })

  const { dom: wrapperDOM, setDom } = createDomRef()
  const sideMenuWidth = "clamp(40px, 30vw, 400px)"
  // const sideMenuHeight = "80dvh"
  return (
    <Item // subcomponent area grid-item
      domRef={setDom}
      name={"side-menu"}
      shadowProps={shadowProps}
      icss={{
        gridArea: "side",
        width: isSideMenuOpen() && !isSideMenuFloating() ? sideMenuWidth : "0vw",
        transition: "500ms",
      }}
      render:self={renderAsHTMLAside}
    >
      <Box // size & position placeholder
        icss={{
          width: sideMenuWidth,
          position: "relative",
          transform: isSideMenuOpen() ? "translateX(0)" : "translateX(-100%)",
          transition: "500ms",
          height: "100%",
          zIndex: 999,
        }}
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
                }
              : { left: "0", top: "0", width: "100%", height: "100%" },
          ]}
        >
          {props.children}
        </Box>
      </Box>
    </Item>
  )
}
