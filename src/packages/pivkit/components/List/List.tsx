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

export interface ListProps<T> {
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

export interface ListController {}

export interface InnerListContext {
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
      reachBottomMargin: 50
    }
  })
  // [configs]
  const allItems = createMemo(() => (isArray(props.items) ? props.items : [...(props.items ?? [])]))
  const increaseRenderCount = createMemo(
    () => props.increaseRenderCount ?? Math.min(Math.floor(allItems().length / 10), 30)
  )
  const initRenderCount = createMemo(() => props.initRenderCount ?? Math.min(Math.floor(allItems().length / 5), 50))

  // [list ref]
  const [listRef, setRef] = createRef<HTMLElement>()

  // [add to context, this observer can make listItem can auto render or not]
  const { observe, destory } = useIntersectionObserver({ rootRef: listRef, options: { rootMargin: '100%' } })
  onCleanup(() => destory())

  // [actually showed item count]
  const [renderItemLength, setRenderItemLength] = createSignal(initRenderCount())

  // [scroll handler]
  const { forceCalculate } = useScrollDegreeDetector(listRef, {
    onReachBottom: () => {
      console.log('33: ', 33)
      setRenderItemLength((n) => n + increaseRenderCount())
    },
    reachBottomMargin: props.reachBottomMargin
  })

  // reset when items.length changed
  createEffect(
    on(
      () => allItems().length,
      () => {
        setRenderItemLength(initRenderCount())
        forceCalculate()
      }
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
      <Piv domRef={setRef} shadowProps={props} icss={{ height: '50dvh', overflow: 'scroll', contain: 'paint' }}>
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
