import { Accessor, createEffect, createMemo, createSignal } from 'solid-js'
import { isNumber, isObject, isString, shrinkFn } from '@edsolater/fnkit'

/**
 * used in {@link useItems}
 */
function defaultGetItemValue(item: any): string | number {
  return isString(item) || isNumber(item)
    ? item
    : isObject(item)
      ? item['value'] ?? item['id'] ?? item['key'] ?? String(item)
      : String(item)
}

/**
 * provide some methods to manage items
 * - {@link currentItem} current active item
 * - {@link itemList} all items
 * - {@link setItem} set current active item
 *
 * - {@link addItemToItemList} add one or multi items
 * - {@link removeToItemList} remove one or multi items
 * - {@link updateNewItemList} update all candidates items
 *
 *
 * value should be unique, it is used as unique key
 */
export function useItems<T>(options?: {
  items?: T[]

  //if both value and defaultValue are not specified, the first item will be used as default value
  value?: T
  defaultValue?: T
  /** value is used in onChange, value is also used as key */
  getItemValue?: (item: T) => string | number
  /** only invoked when options:value is not currentValue */
  onChange?(utils: { item: Accessor<T>; index: Accessor<number>; value: Accessor<string | number> }): void
  onClear?(): void
}) {
  const [items, setItems] = createSignal(options?.items ?? [])
  const [currentItem, setCurrentItem] = createSignal(options?.defaultValue ?? options?.value)
  const currentItemIndex = createMemo(() => {
    const item = currentItem()
    if (!item) return undefined
    const idx = items()?.indexOf(item)
    return idx > 0 ? idx : undefined
  })

  function getItemValue(item: T | undefined): string | number {
    return item ? options?.getItemValue?.(item) ?? defaultGetItemValue(item) : defaultGetItemValue(item)
  }

  const itemValue = createMemo(() => {
    const item = currentItem()
    return getItemValue(item)
  })
  createEffect(() => {
    const item = options?.value
    if (item) setItem(item)
  })

  function updateNewItemList(newItems: T[]) {
    setItems(newItems)
  }
  function addItemToItemList(...newItems: T[]) {
    updateNewItemList([...items(), ...newItems])
  }
  function removeToItemList(...newItems: T[]) {
    updateNewItemList(items().filter((item) => !newItems.includes(item)))
  }
  function setItem(newItem: T | undefined | ((prev: T | undefined) => T | undefined)) {
    const newI = shrinkFn(newItem, [currentItem()]) as T | undefined
    if (newI == null) {
      clearItem()
    } else {
      const newItemIsInItems = items()?.includes(newI)
      if (newI !== currentItem() && newItemIsInItems) {
        // @ts-expect-error why?🏷️🤔
        setCurrentItem(newI)
        options?.onChange?.({ item: () => newI, index: () => currentItemIndex()!, value: itemValue })
      }
    }
  }
  function clearItem() {
    setCurrentItem(undefined)
    options?.onClear?.()
  }
  return {
    item: currentItem,
    index: currentItemIndex,
    items: items,
    setItem,
    clearItem,
    updateNewItemList,
    addItemToItemList,
    removeToItemList,

    utils: {
      getItemValue,
    },
  }
}
