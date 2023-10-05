import { createContext, createEffect, useContext } from 'solid-js'
import { Piv, PivProps } from '../piv'
import { KitProps, UIKit, useKitProps } from '../piv'
import { createToggle } from '../hooks/createToggle'
import { Accessify } from '../utils/accessifyProps'
import { renderHTMLDOM } from '../piv/propHandlers/renderHTMLDOM'

export interface CollapseProps extends UIKit<{ controller: CollapseController; htmlPropsTagName: 'details' }> {
  /** TODO: open still can't auto lock the trigger not controled component now */
  open?: Accessify<boolean | undefined, CollapseController>
  defaultOpen?: Accessify<boolean | undefined, CollapseController>
  collapseDirection?: 'down' | 'up'
  onOpen?(): void
  onClose?(): void
  onToggle?(): void
}

export interface CollapseController {
  readonly isOpen: boolean
  open(): void
  close(): void
  toggle(): void
  set(toOpen: boolean): void
}

const CollapseContext = createContext<CollapseController>({} as CollapseController, { name: 'CollapseController' })

export function Collapse(rawProps: CollapseProps) {
  const { props } = useKitProps(rawProps, { name: 'Collapse', controller: () => controller })

  const [innerOpen, { toggle, on, off, set }] = createToggle(props.open ?? props.defaultOpen ?? false, {
    onOff: props.onClose,
    onOn: props.onOpen,
    onToggle: props.onToggle,
  })

  // reset innerOpen when props.open changes
  createEffect(() => {
    set(Boolean(props.open))
  })

  const controller: CollapseController = {
    get isOpen() {
      return innerOpen()
    },
    open: on,
    close: off,
    toggle,
    set,
  }
  return (
    <CollapseContext.Provider value={controller}>
      <Piv<'details'>
        render:self={(selfProps) => renderHTMLDOM('details', selfProps)}
        shadowProps={props}
        onClick={toggle}
        htmlProps={{ open: innerOpen() }}
      />
    </CollapseContext.Provider>
  )
}

interface CollapseFaceProps {}

export function CollapseFace(
  rawProps: KitProps<
    CollapseFaceProps,
    {
      controller: CollapseController
      htmlPropsTagName: 'summary'
    }
  >
) {
  const controller = useContext(CollapseContext)
  const { props } = useKitProps(rawProps, { name: 'CollapseFase', controller: () => controller })
  return (
    <Piv<'summary', CollapseController>
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

Collapse.Face = CollapseFace
Collapse.Content = CollapseContent
