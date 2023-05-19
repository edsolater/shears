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

  // isIntersecting with parent `<List>`'s intersectionObserver
  const listContext = useContext(ListContext)
  const [isIntersecting, setIsIntersecting] = createSignal(false)
  createEffect(() => {
    const el = itemRef()
    if (!el) return
    listContext.observeFunction?.(el, ({ entry }) => {
      setIsIntersecting(entry.isIntersecting)
    })
  })

  const controller: ListItemController = {
    isIntersecting
  }
  lazyLoadController(controller)
  const childContent = createMemo(() => props.children())
  return (
    <Piv
      ref={setRef}
      shadowProps={omit(props, 'children')}
      icss={{ visibility: isIntersecting() ? 'visible' : 'hidden' }}
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
