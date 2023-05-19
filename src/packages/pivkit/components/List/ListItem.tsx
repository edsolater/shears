import { Accessor, JSX, Show, createEffect, createMemo, createSignal, onCleanup, useContext } from 'solid-js'
import { KitProps, Piv, useKitProps } from '../../../piv'
import { createRef } from '../../hooks/createRef'
import { ListContext } from './List'
import { omit } from '../../../piv/utils/omit'
import useResizeObserver from '../../hooks/useResizeObserver'

export type ListItemProps = {
  children: () => JSX.Element
}

export type ListItemController = {
  isIntersecting: Accessor<boolean>
}
/**
 * context acceptor for `<List>` \
 * only used in `<List>`
 */
export function ListItem(
  rawProps: KitProps<ListItemProps, { controller: ListItemController; noNeedAccessifyChildren: true }>
) {
  // console.count('render ListItem')
  const { props, lazyLoadController } = useKitProps(rawProps, { noNeedAccessifyChildren: true })

  const [itemRef, setRef] = createRef<HTMLElement>()

  //=== isIntersecting with parent `<List>`'s intersectionObserver
  const listContext = useContext(ListContext)
  const [isIntersecting, setIsIntersecting] = createSignal(false)
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
  const controller: ListItemController = {
    isIntersecting
  }
  lazyLoadController(controller)

  //=== render children
  const childContent = createMemo(() => props.children())
  return (
    <Piv
      debugLog={[]}
      domRef={[setRef, setSizeDetectorTarget]} // FIXME: why ref not setted🤔?
      shadowProps={omit(props, 'children')} // FIXME: should not use tedius omit
      style={{
        height: isIntersecting() ? undefined : `${innerHeight()}px`,
        width: isIntersecting() ? undefined : `${innerWidth()}px`
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
  onCleanup(destory)

  function detectSize(el: HTMLElement) {
    if (!el) return
    setInnerHeight(el.clientHeight)
    setInnerWidth(el.clientWidth)
  }
  return { setRef, innerWidth, innerHeight }
}
