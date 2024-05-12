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

export type AppKeeperPanelManagerProps = {
  panelName: string
  canFloating?: boolean
  defaultOpen?: boolean
  defaultFloating?: boolean
  canWidthResized?: boolean
  initWidth?: number | string
  canHeightResized?: boolean
  initHeight?: number
  toggleShortcut: MayArray<KeybordShortcutKeys>
  changeToFloatingShortcut: MayArray<KeybordShortcutKeys>
  children?: PivChild
}

export function AppKeeperPanelManager(kitprops: KitProps<AppKeeperPanelManagerProps>) {
  const { props, shadowProps } = useKitProps(kitprops)
  const panelName = props.panelName
  const [keeperContext, setKeeperContext] = useComponentContext(AppKeeperContext)
  const [isPanelOpen, { toggle: togglePanel }] = createDisclosure(props.defaultOpen)
  const [isPanelFloating, { toggle: togglePanelFloating }] = createDisclosure(props.defaultFloating)
  // TODO
  // setKeeperContext({ isPanelOpen: { [panelName]: true }, isPanelFloating: { [panelName]: true } })
  useShortcutsRegister(documentElement, {
    [`Toggle Panel:${panelName}`]: {
      shortcut: props.toggleShortcut,
      fn: () => {
        console.log("3: ", 3)
        togglePanel()
      },
    },
    [`Toggle Floating Mode of Panel:${panelName}`]: {
      shortcut: props.changeToFloatingShortcut,
      fn: () => {
        console.log("4: ", 4)
        togglePanelFloating()
      },
    },
  })

  const [haveRenderContent, setHaveRenderContent] = createSignal(isPanelOpen()) // one-way of isPanelOpen
  createEffect(() => {
    if (isPanelOpen()) {
      setHaveRenderContent(true)
    }
  })
  const [panelWidth, setPanelWidth] = useLocalStorageValue(`__AppKeeper_${panelName}-x`, String(props.initWidth ?? 0))
  const [panelHeight, setPanelHeight] = useLocalStorageValue(
    `__AppKeeper_${panelName}-y`,
    String(props.initHeight ?? 0),
  )

  const { dom: wrapperDOM, setDom } = createDomRef()
  const { dom: sizePlaceholderDOM, setDom: setSizePlaceholderDOM } = createDomRef()

  const [resizablePluginModule, { resizingHiddenTransactionMask }] = usePlugin(resizablePlugin, {
    onSizeChange({ currentVal, dir }) {
      if (dir === "x") setPanelWidth(currentVal.toFixed(3))
      if (dir === "y") setPanelHeight(currentVal.toFixed(3))
    },
    onResizing({ currentVal, dir }) {
      if (dir === "x") wrapperDOM()?.style.setProperty(`--${panelName}-x`, `${currentVal}px`)
      if (dir === "y") wrapperDOM()?.style.setProperty(`--${panelName}-y`, `${currentVal}px`)
    },

    canResizeY: false,
    canResizeX: true,
  })
  return (
    <Piv // subcomponent area grid-item
      class={`panel-${panelName}`}
      domRef={[setDom, resizingHiddenTransactionMask]}
      shadowProps={shadowProps}
      icss={{
        // width: cssVar("--side-menu-width"),
        width: props.canWidthResized
          ? isPanelOpen() && !isPanelFloating()
            ? cssVar(`--${panelName}-x`)
            : "0vw"
          : "unset",
        height: props.canHeightResized
          ? isPanelOpen() && !isPanelFloating()
            ? cssVar(`--${panelName}-y`)
            : "0vh"
          : "unset",
        transition: "500ms",
      }}
      render:self={renderAsHTMLAside}
      style={{
        [`--${panelName}-x`]: props.canWidthResized ? (panelWidth() ? `${panelWidth()}px` : "auto") : undefined,
        [`--${panelName}-y`]: props.canHeightResized ? (panelHeight() ? `${panelHeight()}px` : "auto") : undefined,
      }}
    >
      <Box // size & position placeholder (always static, so it can hold size info)
        class="panel-placeholder"
        domRef={[setSizePlaceholderDOM, resizingHiddenTransactionMask]}
        icss={{
          width: props.canWidthResized ? cssVar(`--${panelName}-x`) : "100%",
          height: props.canHeightResized ? cssVar(`--${panelName}-y`) : "100%",
          position: "relative",
          transform: props.canWidthResized
            ? isPanelOpen()
              ? "translateX(0)"
              : "translateX(-100%)"
            : props.canHeightResized
              ? isPanelOpen()
                ? "translateY(0)"
                : "translateY(-100%)"
              : "unset",
          transition: "500ms",
          zIndex: 999,
        }}
        plugin={resizablePluginModule}
      >
        <Box // content holder (always absolute, so it has no size info)
          icss={[
            {
              background: colors.appPanelBg,
              position: "absolute",
              containerType: "size",
              transition: "200ms",
            },
            isPanelFloating()
              ? {
                  top: "8px",
                  left: "8px",
                  height: "calc(100% - 16px)",
                  width: `calc(100% - 8px)`,
                  borderRadius: "16px",
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
