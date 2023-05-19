import {
  Accessor,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  For,
  Index,
  JSXElement,
  on,
  onCleanup,
  Show
} from 'solid-js'
import { KitProps, Piv, useKitProps } from '../../../piv'
import { createRef } from '../../hooks/createRef'
import { useElementSize } from '../../hooks/useElementSize'
import { isArray, isObject } from '@edsolater/fnkit'
import { ObserveFn, useIntersectionObserver } from '../../hooks/useIntersectionObserver'
import { useScrollDegreeDetector } from '../../hooks/useScrollDegreeDetector'
import { ListItem } from './ListItem'

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

export type ListController = {}

export type InnerListContext = {
  observeFunction?: ObserveFn<HTMLElement>
  renderItemLength?: Accessor<number>
}

export const ListContext = createContext<InnerListContext>({} as InnerListContext, { name: 'ListController' })

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
  const allItems = createMemo(() => (isArray(props.items) ? props.items : [...(props.items ?? [])]))
  const [listRef, setRef] = createRef<HTMLElement>()

  // add to context, this observer can make listItem can auto render or not
  const { observe, destory } = useIntersectionObserver({ rootRef: listRef, options: { rootMargin: '100%' } })
  onCleanup(() => destory())

  // actually showed itemLength
  const [renderItemLength, setRenderItemLength] = createSignal(props.initRenderCount)

  useScrollDegreeDetector(listRef, {
    onReachBottom: () => {
      setRenderItemLength((n) => n + props.increaseRenderCount)
    },
    reachBottomMargin: props.reachBottomMargin
  })

  // reset when items.length changed
  createEffect(
    on(
      () => allItems().length,
      () => setRenderItemLength(props.initRenderCount)
    )
  )
  const renderListItems = (item: T, idx: () => number) => {
    // console.count('render item children in <For>')
    return (
      <Show when={checkNeedRenderByIndex(idx(), renderItemLength())}>
        <ListItem>{() => props.children(item, idx)}</ListItem>
      </Show>
    )
  }
  return (
    <ListContext.Provider value={{ observeFunction: observe, renderItemLength }}>
      <Piv ref={setRef} shadowProps={props} icss={{ height: '50dvh', overflow: 'scroll', contain: 'paint' }}>
        <For each={allItems()}>{renderListItems}</For>
      </Piv>
    </ListContext.Provider>
  )
}

/**
 * render may be not visiable
 */
function checkNeedRenderByIndex(idx: number | undefined, renderItemLength: number | undefined) {
  if (idx == null) return false
  if (renderItemLength == null) return false
  return idx <= renderItemLength
}

const cache = new WeakMap<Record<keyof any, any>, any>()

/**
 * usually use in `<List>`'s `<For>`\
 * cache the result to avoid render same item again
 */
function renderCache<T>(item: unknown, renderFunction: () => T): T {
  if (!isObject(item)) return renderFunction()

  if (!cache.has(item)) {
    cache.set(item, renderFunction())
  }

  return cache.get(item)
}
