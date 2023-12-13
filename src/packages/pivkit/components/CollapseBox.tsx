import { createContext, useContext } from 'solid-js'
import { createToggle } from '../hooks/createToggle'
import { KitProps, Piv, PivChild, PivProps, useKitProps } from '../piv'
import { renderHTMLDOM } from '../piv/propHandlers/renderHTMLDOM'
import { createController } from '../utils/createController'
import { Box } from './Boxes'
import { createCSSCollapsePlugin } from '../plugins/useCSSTransition'

export interface CollapseBoxProps {
  /** TODO: open still can't auto lock the trigger not controled component now */
  open?: boolean
  defaultOpen?: boolean
  collapseDirection?: 'down' | 'up'
  onOpen?(): void
  onClose?(): void
  onToggle?(): void

  'render:Face'?: PivChild
  'render:Content'?: PivChild
  //TODO
  // 'renderMapLayout'?:
}

export interface CollapseBoxController {
  readonly isOpen: boolean
  open(): void
  close(): void
  toggle(): void
  set(toOpen: boolean): void
}

const CollapseContext = createContext<CollapseBoxController>({} as CollapseBoxController, {
  name: 'CollapseController',
})

/**
 * @example
 * <Collapse renderFace={'Hello'} renderContent={<Box></Box>} configRenderLayout={({WrapperBox, Face, Content}) => (<WraperBox>
 *				<Face />
 *				<Content />
 *			</WrapperBox>)} />
 */
export function CollapseBox(rawProps: KitProps<CollapseBoxProps, { controller: CollapseBoxController }>) {
  const { props, shadowProps } = useKitProps(rawProps, { name: 'Collapse', controller: () => controller })

  const [innerOpen, { toggle, on, off, set }] = createToggle(() => props.open ?? props.defaultOpen ?? false, {
    onOff: props.onClose,
    onOn: props.onOpen,
    onToggle: props.onToggle,
  })

  const controller = createController<CollapseBoxController>({
    isOpen: () => innerOpen(),
    open: () => on,
    close: () => off,
    toggle: () => toggle,
    set: () => set,
  })

  const {
    controller: { open: openCollapse, close: closeCollapse, toggle: toggleCollapse, opened: isCollapseOpened },
    plugin,
  } = createCSSCollapsePlugin()
  return (
    <Box shadowProps={shadowProps}>
      {/* Face */}
      {props['render:Face'] && <Box class='Face'>{props['render:Face']}</Box>}

      {/* Content */}
      {props['render:Content'] && (
        <Box class='Content' plugin={plugin}>
          {props['render:Content']}
        </Box>
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
      htmlPropsTagName: 'summary'
    }
  >,
) {
  const controller = useContext(CollapseContext)
  const { props } = useKitProps(rawProps, { name: 'CollapseFase', controller: () => controller })
  return (
    <Piv<'summary', CollapseBoxController>
      render:self={(selfProps) => renderHTMLDOM('summary', selfProps)}
      shadowProps={props}
      icss={{ listStyle: 'none' }}
      innerController={controller}
    >
      {props.children}
    </Piv>
  )
}

interface CollapseContentProps extends PivProps {}

export function CollapseContent(rawProps: CollapseContentProps) {
  const controller = useContext(CollapseContext)
  const { props } = useKitProps(rawProps, { name: 'CollapseContent', controller: () => controller })
  return <Piv shadowProps={props} innerController={controller} />
}

CollapseBox.Face = CollapseFace
CollapseBox.Content = CollapseContent
