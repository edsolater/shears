import { shrinkFn } from '@edsolater/fnkit'
import { createContext, createEffect, useContext } from 'solid-js'
import { Piv } from '../../piv'
import { KitProps, useKitProps } from '../../piv/createKit'
import { createToggle } from '../hooks/createToggle'

type CollapseProps = {
  /** TODO: open still can't auto lock the trigger not controled component now */
  open?: boolean
  defaultOpen?: boolean
  collapseDirection?: 'down' | 'up'
  onOpen?(): void
  onClose?(): void
  onToggle?(): void
}

type CollapseController = {
  readonly isOpen: boolean
  open(): void
  close(): void
  toggle(): void
  set(toOpen: boolean): void
}

const CollapseContext = createContext<CollapseController>({} as CollapseController, { name: 'CollapseController' })

export function Collapse(
  rawProps: KitProps<CollapseProps, { controller: CollapseController; htmlPropsTagName: 'details' }>
) {
  const props = useKitProps(rawProps, { controller: () => controller })

  const [innerOpen, { toggle, on, off, set }] = createToggle(props.open ?? props.defaultOpen ?? false, {
    onOff: props.onClose,
    onOn: props.onOpen,
    onToggle: props.onToggle
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
    set
  }
  return (
    <CollapseContext.Provider value={controller}>
      <Piv<'details'>
        as={(parsedPivProps) => <details {...parsedPivProps} />}
        shadowProps={props}
        onClick={toggle}
        htmlProps={{ open: innerOpen() }}
      />
    </CollapseContext.Provider>
  )
}

type CollapseFaceProps = {}

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
  const props = useKitProps<CollapseFaceProps>(rawProps, { controller: () => controller })
  return (
    <Piv<'summary'>
      as={(parsedPivProps) => <summary {...parsedPivProps} />}
      shadowProps={props}
      icss={{ listStyle: 'none' }}
    >
      {props.children}
    </Piv>
  )
}

type CollapseContentProps = {}

export function CollapseContent(rawProps: KitProps<CollapseContentProps, { controller: CollapseController }>) {
  const controller = useContext(CollapseContext)
  const props = useKitProps<CollapseContentProps, CollapseController>(rawProps, { controller: () => controller })
  return <Piv shadowProps={props}>{shrinkFn(props.children, [controller])}</Piv>
}

Collapse.Face = CollapseFace
Collapse.Content = CollapseContent
