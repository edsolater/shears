import type { MayArray } from "@edsolater/fnkit"
import {
  Box,
  KitProps,
  Piv,
  PivChild,
  createDisclosure,
  createDomRef,
  cssVar,
  renderAsHTMLAside,
  resizablePlugin,
  useComponentContext,
  useKitProps,
  usePlugin,
  useShortcutsRegister,
  type KeybordShortcutKeys,
} from "@edsolater/pivkit"
import { createEffect, createSignal } from "solid-js"
import { AppKeeperContext } from "../AppKeeperContext"
import { useLocalStorageValue } from "../../../../packages/cacheManager/hook"
import { colors } from "../../../theme/colors"
import { documentElement } from "../../../utils/documentElement"

/** always render */
export function SideMenuManager(
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
      class="side-menu"
      domRef={[setDom, resizingHiddenTransactionMask]}
      shadowProps={shadowProps}
      icss={{
        gridArea: "side",
        // width: cssVar("--side-menu-width"),
        width: isSideMenuOpen() && !isSideMenuFloating() ? cssVar("--side-menu-width") : "0vw",
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
