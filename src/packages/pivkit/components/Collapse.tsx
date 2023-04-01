import { MayFn, shrinkFn } from '@edsolater/fnkit'
import { createContext, createEffect, JSXElement, useContext } from 'solid-js'
import { Piv } from '../../piv'
import { KitProps, useKitProps } from '../../piv/createKit'
import { createToggle } from '../hooks/createToggle'

type CollapseProps = KitProps<
  {
    open?: boolean
    defaultOpen?: boolean
    collapseDirection?: 'down' | 'up'
    onOpen?(): void
    onClose?(): void
    onToggle?(): void
  },
  { htmlPropsTagName: 'details' }
>
type CollapseController = {
  readonly isOpen: boolean
  open(): void
  close(): void
  toggle(): void
  set(toOpen: boolean): void
}

const CollapseContext = createContext<CollapseController>({} as CollapseController, { name: 'CollapseController' })

export function Collapse(rawProps: CollapseProps) {
  const props = useKitProps(rawProps)

  const [innerOpen, { toggle, on, off, set }] = createToggle(props.open ?? props.defaultOpen ?? false, {
    onOff: props.onClose,
    onOn: props.onOpen,
    onToggle: props.onToggle
  })

  // reset innerOpen when props.open changes
  createEffect(() => {
    set(Boolean(props.open))
  })

  const controller = {
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

type CollapseFaceProps = KitProps<
  {
    children?: MayFn<JSXElement, [controller: CollapseController]>
  },
  {
    htmlPropsTagName: 'summary'
  }
>

export function CollapseFace(rawProps: CollapseFaceProps) {
  const props = useKitProps(rawProps)
  const controller = useContext(CollapseContext)
  return (
    <Piv<'summary'>
      as={(parsedPivProps) => <summary {...parsedPivProps} />}
      shadowProps={props}
      icss={{ listStyle: 'none' }}
    >
      {shrinkFn(props.children, [controller])}
    </Piv>
  )
}

type CollapseContentProps = KitProps<{
  children?: MayFn<JSXElement, [controller: CollapseController]>
}>

export function CollapseContent(rawProps: CollapseContentProps) {
  const props = useKitProps(rawProps)
  const controller = useContext(CollapseContext)
  return <Piv shadowProps={props}>{shrinkFn(props.children, [controller])}</Piv>
}

Collapse.Face = CollapseFace
Collapse.Content = CollapseContent
