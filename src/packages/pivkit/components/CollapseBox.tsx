import { Show, createContext, createEffect, createSignal, useContext } from "solid-js"
import { KitProps, useKitProps } from "../createKit"
import { createDomRef, useClickOutside } from "../hooks"
import { createDisclosure } from "../hooks/createDisclosure"
import { Fragnment, Piv, PivChild, PivProps } from "../piv"
import { renderHTMLDOM } from "../piv/propHandlers/renderHTMLDOM"
import { createCSSCollapsePlugin } from "../plugins/useCSSTransition"
import { createController } from "../utils/createController"
import { Box } from "./Boxes"

export interface CollapseBoxProps {
  /** TODO: open still can't auto lock the trigger not controled component now */
  open?: boolean
  defaultOpen?: boolean
  collapseDirection?: "down" | "up"
  canCloseByOutsideClick?: boolean
  onOpen?(): void
  onClose?(): void
  onToggle?(): void

  renderFace?: PivChild
  renderContent?: PivChild
  //TODO
  // 'renderMapLayout'?:
}
export type CollapseBoxKitProps = KitProps<CollapseBoxProps, { controller: CollapseBoxController }>

export interface CollapseBoxController {
  readonly isOpen: boolean
  isOpenAccessor: () => boolean
  open(): void
  close(): void
  toggle(): void
  set(toOpen: boolean): void
}

const CollapseContext = createContext<CollapseBoxController>({} as CollapseBoxController, {
  name: "CollapseController",
})

/**
 * @example
 * <Collapse renderFace={'Hello'} renderContent={<Box></Box>} configRenderLayout={({WrapperBox, Face, Content}) => (<WraperBox>
 *				<Face />
 *				<Content />
 *			</WrapperBox>)} />
 */
export function CollapseBox(kitProps: CollapseBoxKitProps) {
  const { dom: boxDom, setDom: setBoxDom } = createDomRef()
  const { props, shadowProps } = useKitProps(kitProps, { name: "Collapse", controller: () => controller })

  const [innerOpen, { toggle, open, close, set }] = createDisclosure(() => props.open ?? props.defaultOpen ?? false, {
    onClose: props.onClose,
    onOpen: props.onOpen,
    onToggle: props.onToggle,
  })

  const controller = createController<CollapseBoxController>({
    isOpen: () => innerOpen(),
    isOpenAccessor: () => innerOpen,
    open: () => open,
    close: () => close,
    toggle: () => toggle,
    set: () => set,
  })

  const {
    controller: { open: openCollapse, close: closeCollapse, toggle: toggleCollapse, opened: isCollapseOpened },
    plugin,
  } = createCSSCollapsePlugin()

  // only render content when opened, but don't open twice
  const [hasCollapseBeenOpened, setHasCollapseBeenOpened] = createSignal(isCollapseOpened())
  createEffect(() => setHasCollapseBeenOpened(isCollapseOpened()))

  //sync with innerOpen
  createEffect(() => (innerOpen() ? openCollapse() : closeCollapse()))

  /** {@link CollapseBox} can click outside to close */
  useClickOutside(boxDom, { disabled: !props.canCloseByOutsideClick })

  return (
    <Box shadowProps={shadowProps} domRef={setBoxDom}>
      {/* Face */}
      {"renderFace" in props && (
        <Box
          class="Face"
          onClick={() => {
            toggle()
          }}
        >
          {props["renderFace"]}
        </Box>
      )}

      {/* Content */}
      {"renderContent" in props && (
        <Piv class="Content" plugin={plugin} icss={{ overflow: "hidden" }}>
          <Show when={hasCollapseBeenOpened()}>
            <Fragnment>{props["renderContent"]}</Fragnment>
          </Show>
        </Piv>
      )}
    </Box>
  )
}

interface CollapseFaceProps {}

export function CollapseFace(
  rawProps: KitProps<
    CollapseFaceProps,
    {
      controller: CollapseBoxController
      htmlPropsTagName: "summary"
    }
  >,
) {
  const controller = useContext(CollapseContext)
  const { props } = useKitProps(rawProps, { name: "CollapseFase", controller: () => controller })
  return (
    <Piv<"summary", CollapseBoxController>
      render:self={(selfProps) => renderHTMLDOM("summary", selfProps)}
      shadowProps={props}
      icss={{ listStyle: "none" }}
      innerController={controller}
    >
      {props.children}
    </Piv>
  )
}

interface CollapseContentProps extends PivProps {}

export function CollapseContent(rawProps: CollapseContentProps) {
  const controller = useContext(CollapseContext)
  const { props } = useKitProps(rawProps, { name: "CollapseContent", controller: () => controller })
  return <Piv shadowProps={props} innerController={controller} />
}

CollapseBox.Face = CollapseFace
CollapseBox.Content = CollapseContent
