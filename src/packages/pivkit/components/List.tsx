import { Accessor, createContext, createEffect, createMemo, createSignal, For, JSXElement, useContext } from 'solid-js'
import { KitProps, Piv, useKitProps } from '../../piv'
import { createRef } from '../hooks/createRef'
import { useElementSize } from '../hooks/useElementSize'
import { isArray } from '@edsolater/fnkit'
import { ObserveFn, useIntersectionObserver } from '../hooks/useIntersectionObserver'

export type ListProps<T> = {
  items?: Iterable<T> | undefined
  children(item: T, index: () => number): JSXElement

  /** @default 30 */
  increaseRenderCount?: number
  /**
   * @default 30
   * can accept Infinity
   */
  initRenderCount?: number
  /** @default 50(px) */
  reachBottomMargin?: number
}

export type ListController<T = any> = {}

export type ListContext<T = any> = {
  observeFunction?: ObserveFn<HTMLElement>
}

const ListContext = createContext<ListContext>({} as ListContext, { name: 'ListController' })

/**
 * if for layout , don't render important content in Box
 */
export function List<T>(rawProps: KitProps<ListProps<T>, { noNeedAccessifyChildren: true }>) {
  const { props } = useKitProps(rawProps, {
    noNeedAccessifyChildren: true,
    defaultProps: {
      initRenderCount: 30,
      increaseRenderCount: 30,
      reachBottomMargin: 50
    }
  })

  // -------- determine size  --------
  const [listRef, setRef] = createRef<HTMLElement>()
  const { width, height } = useElementSize(listRef)
  const isHeightSmall = createMemo(() => (height() ?? Infinity) < 500)
  const isWidthSmall = createMemo(() => (width() ?? Infinity) < 800)
  const { observe, destory } = useIntersectionObserver({ rootRef: listRef, options: { rootMargin: '100%' } })

  /* ---------------------------------- props --------------------------------- */
  const renderItems = createMemo(() => (isArray(props.items) ? props.items : [...(props.items ?? [])]))
  return (
    <ListContext.Provider value={{ observeFunction: observe }}>
      <Piv ref={setRef} shadowProps={props}>
        <For each={renderItems()}>{(item, idx) => props.children(item, idx)}</For>
      </Piv>
    </ListContext.Provider>
  )
}

export type ListItemProps = {}
export type ListItemController = {
  isIntersecting: Accessor<boolean>
}
/** 
 * context acceptor for {@link List} \
 * wrap {@link ListItem}'s content to use
 */
export function ListItem(rawProps: KitProps<ListItemProps, { controller: ListItemController }>) {
  const { props, lazyLoadController } = useKitProps(rawProps)

  const listContext = useContext(ListContext)
  const [itemRef, setRef] = createRef<HTMLElement>()
  const [isIntersecting, setIsIntersecting] = createSignal(false)

  const controller: ListItemController = {
    isIntersecting
  }
  lazyLoadController(controller)

  createEffect(() => {
    const el = itemRef()
    if (!el) return
    listContext.observeFunction?.(el, ({ entry }) => {
      setIsIntersecting(entry.isIntersecting)
    })
  })

  return (
    <Piv ref={setRef} shadowProps={props} icss={{ visibility: isIntersecting() ? 'visible' : 'hidden' }}>
      {props.children}
    </Piv>
  )
}
