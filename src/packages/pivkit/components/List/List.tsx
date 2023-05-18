import { createContext, createEffect, createMemo, createSignal, For, JSXElement, on, onCleanup } from 'solid-js'
import { KitProps, Piv, useKitProps } from '../../../piv'
import { createRef } from '../../hooks/createRef'
import { useElementSize } from '../../hooks/useElementSize'
import { isArray, isObject } from '@edsolater/fnkit'
import { ObserveFn, useIntersectionObserver } from '../../hooks/useIntersectionObserver'
import { useScrollDegreeDetector } from '../../hooks/useScrollDegreeDetector'

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

export type ListContextType<T = any> = {
  observeFunction?: ObserveFn<HTMLElement>
}

export const ListContext = createContext<ListContextType>({} as ListContextType, { name: 'ListController' })

/**
 * if for layout , don't render important content in Box
 */
export function List<T>(rawProps: KitProps<ListProps<T>, { noNeedAccessifyChildren: true }>) {
  const { props } = useKitProps(rawProps, {
    noNeedAccessifyChildren: true,
    defaultProps: {
      initRenderCount: 30,
      increaseRenderCount: 30,
      reachBottomMargin: 5
    }
  })
  const allItems = createMemo(() => (isArray(props.items) ? props.items : [...(props.items ?? [])]))
  const [listRef, setRef] = createRef<HTMLElement>()

  // add to context, this observer can make listItem can auto render or not
  const { observe, destory } = useIntersectionObserver({ rootRef: listRef, options: { rootMargin: '100%' } })
  onCleanup(() => destory())

  // actually showed itemLength
  const [renderItemLength, setRenderItemLength] = createSignal(props.initRenderCount)

  createEffect(() => {
    console.log('props.reachBottomMargin: ', props.reachBottomMargin) // FIXME: why render twice?
  })

  useScrollDegreeDetector(listRef, {
    onReachBottom: () => {
      setRenderItemLength((n) => n + props.increaseRenderCount)
    },
    reachBottomMargin: props.reachBottomMargin
  })

  createEffect(
    on(
      () => props.items,
      () => setRenderItemLength(props.initRenderCount)
    )
  )
  return (
    <ListContext.Provider value={{ observeFunction: observe }}>
      <Piv ref={setRef} shadowProps={props} icss={{ height: '50dvh', overflow: 'scroll', contain: 'paint' }}>
        <For each={allItems().slice(0, renderItemLength())}>
          {(item, idx) => renderCache(item, () => props.children(item, idx))}
        </For>
      </Piv>
    </ListContext.Provider>
  )
}

const cache = new WeakMap<Record<keyof any, any>, any>()

/**
 * usually use in `<List>`'s `<For>`\
 * cache the result to avoid render same item again
 */
function renderCache<T>(item: unknown, renderFunction: () => T): T {
  if (!isObject(item)) return renderFunction()

  if (!cache.has(item)) {
    const renderResult = renderFunction()
    cache.set(item, renderResult)
  }

  return cache.get(item)
}
