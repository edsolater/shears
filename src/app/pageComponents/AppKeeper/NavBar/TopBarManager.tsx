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
import { renderAsHTMLNav } from "@edsolater/pivkit"

/** always render */
export function TopBarManager(
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
    defaultProps: { toggleShortcut: "alt + '", changeToFloatingShortcut: "shift + alt + '" },
  })
  const [layoutContext, setLayoutContext] = useComponentContext(AppKeeperContext)
  const [isTopBarOpen, { toggle: toggleTopBar }] = createDisclosure(props.defaultOpen)
  const [isTopBarFloating, { toggle: toggleTopBarFloating }] = createDisclosure(props.defaultFloating)
  setLayoutContext({ isTopBarOpen, isTopBarFloating })
  useShortcutsRegister(documentElement, {
    "Toggle Top Menu": {
      shortcut: props.toggleShortcut,
      fn: () => {
        toggleTopBar()
      },
    },
    "Topbar Floating Mode": {
      shortcut: props.changeToFloatingShortcut,
      fn: () => {
        toggleTopBarFloating()
      },
    },
  })

  const [haveRenderContent, setHaveRenderContent] = createSignal(isTopBarOpen()) // one-way of isTopBarOpen
  createEffect(() => {
    if (isTopBarOpen()) {
      setHaveRenderContent(true)
    }
  })
  const [topBarHeight, setTopBarHeight] = useLocalStorageValue("_top-bar-height", "80")
  const { dom: wrapperDOM, setDom } = createDomRef()
  const { dom: sizePlaceholderDOM, setDom: setSizePlaceholderDOM } = createDomRef()

  const [resizablePluginModule, { resizingHiddenTransactionMask }] = usePlugin(resizablePlugin, {
    onSizeChange({ currentVal }) {
      setTopBarHeight(currentVal.toFixed(3))
    },
    onResizing({ currentVal }) {
      wrapperDOM()?.style.setProperty("--top-bar-height", `${currentVal}px`)
    },

    canResizeY: true,
    canResizeX: false,
  })
  return (
    <Piv // subcomponent area grid-item
      domRef={[setDom, resizingHiddenTransactionMask]}
      class={"top-bar"}
      shadowProps={shadowProps}
      icss={{
        height: isTopBarOpen() && !isTopBarFloating() ? cssVar("--top-bar-height") : "0vh",
        transition: "500ms",
      }}
      render:self={renderAsHTMLNav}
      style={() => ({
        "--top-bar-height": `${topBarHeight()}px`,
      })}
    >
      <Box // size & position placeholder
        domRef={[setSizePlaceholderDOM, resizingHiddenTransactionMask]}
        icss={{
          height: cssVar("--top-bar-height"),
          position: "relative",
          transform: isTopBarOpen() ? "translateY(0)" : "translateY(-100%)",
          transition: "500ms",
          width: "100%",
          zIndex: 1000,
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
            isTopBarFloating()
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
