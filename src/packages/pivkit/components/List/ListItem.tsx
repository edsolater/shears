import { Accessor, JSX, createEffect, createMemo, createSignal, onCleanup, splitProps, useContext } from 'solid-js'
import { Piv, PivProps, useKitProps } from '../../piv'
import { omit } from '../../piv'
import { createRef } from '../../hooks/createRef'
import useResizeObserver from '../../domkit/hooks/useResizeObserver'
import { ListContext } from './List'

export interface ListItemProps extends Omit<PivProps, 'children'> {
  children: () => JSX.Element
  // TODO: just forceVisiable is not enough, should have more control props
  forceVisiable?: boolean
}

export interface ListItemController {
  isIntersecting: Accessor<boolean>
}
/**
 * context acceptor for `<List>` \
 * only used in `<List>`
 */
export function ListItem(originalProps: ListItemProps) {
  const [childrenProps, rawProps] = splitProps(originalProps, ['children'])
  const children = childrenProps.children
  const { props, lazyLoadController } = useKitProps(rawProps, { name: 'ListItem' })

  const [itemRef, setRef] = createRef<HTMLElement>()

  //=== isIntersecting with parent `<List>`'s intersectionObserver
  const listContext = useContext(ListContext)
  const [isIntersecting, setIsIntersecting] = createSignal(Boolean(props.forceVisiable))
  createEffect(() => {
    const el = itemRef()
    if (!el) return
    listContext.observeFunction?.(el, ({ entry }) => {
      setIsIntersecting(entry.isIntersecting)
    })
  })

  //=== size observer
  const { setRef: setSizeDetectorTarget, innerHeight, innerWidth } = useElementSizeDetector()

  //=== Controller
  const controller: ListItemController = { isIntersecting }
  lazyLoadController(controller)

  //=== render children
  const childContent = createMemo(() => children())

  return (
    <Piv
      class='ListItem'
      domRef={[setRef, setSizeDetectorTarget]} // FIXME: why ref not setted🤔?
      shadowProps={omit(props, 'children')} // FIXME: should not use tedius omit
      style={{
        height: isIntersecting() ? undefined : `${innerHeight()}px`,
        width: isIntersecting() ? undefined : `${innerWidth()}px`,
      }}
      icss={{ visibility: isIntersecting() ? 'visible' : 'hidden', width: '100%' }}
    >
      {childContent}
    </Piv>
  )
}

/** use by listItem's canRender */
function useElementSizeDetector() {
  const [innerWidth, setInnerWidth] = createSignal<number>()
  const [innerHeight, setInnerHeight] = createSignal<number>()

  const [ref, setRef] = createRef<HTMLElement>()

  const { destory } = useResizeObserver(ref, ({ el }) => {
    detectSize(el)
  })

  function detectSize(el: HTMLElement) {
    if (!el) return
    setInnerHeight(el.clientHeight)
    setInnerWidth(el.clientWidth)
  }
  return { setRef, innerWidth, innerHeight }
}
