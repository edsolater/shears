import { MayFn, shrinkFn } from '@edsolater/fnkit'
import { createContext, JSXElement, useContext } from 'solid-js'
import { Piv } from '../../piv'
import { KitProps, useKitProps } from '../../piv/createKit'
import { createToggle } from '../hooks/createToggle'

type CollapseProps = KitProps<
  {
    open?: boolean
    defaultOpen?: boolean
    collapseDirection?: 'down' | 'up'
    /**
     * when it's not summary, `<Collapse>` will not render as `<details>` but only `<Piv>`
     */
    onlyContent?: boolean
    onOpen?(): void
    onClose?(): void
    onToggle?(): void
  },
  { htmlPropsTagName: 'details' | 'div' }
>
type CollapseController = {
  readonly contentOnlyMode: boolean
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

  const controller = {
    get contentOnlyMode() {
      return Boolean(props.onlyContent)
    },
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
      <Piv<'details' | 'div'>
        as={props.onlyContent ? undefined : (parsedPivProps) => <details {...parsedPivProps} />}
        shadowProps={props}
        onClick={toggle}
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
