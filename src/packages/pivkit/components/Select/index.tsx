import { Accessor } from 'solid-js'
import { KitProps, useKitProps } from '../../createKit'
import { Piv, PivChild, renderAsHTMLSelect } from '../../piv'
import { useItems } from './useItems'
import { AnyFn, Primitive } from '@edsolater/fnkit'
import { Loop } from '../Loop'

type SelectableItem = unknown

type ItemEventUtils<T extends SelectableItem> = {
  item: T
  index: Accessor<number>
  /** use this, for it's value won't change if item's struct change */
  value: Accessor<string | number>
}

export type SelectProps<T extends SelectableItem> = {
  name?: string

  // variant?: 'filled' | 'filledFlowDark' | 'filledDark' | 'roundedFilledFlowDark' | 'roundedFilledDark'
  items?: T[]
  value?: T
  defaultValue?: T
  /** value is used in onChange, value is also used as key */
  getItemValue?: (item: T) => string | number
  onChange?(utils: ItemEventUtils<T>): void

  disabled?: boolean
  placeholder?: PivChild
  hasDivider?: boolean
  hasDownIcon?: boolean
  renderItem?(utils: ItemEventUtils<T>): PivChild
  /** if not spcified use renderItem */
  renderTriggerItem?(utils: ItemEventUtils<T>): PivChild
  renderFacePrefix?: (payloads: {
    open: Accessor<boolean>
    item: T
    index: Accessor<number>
    value: string | number
  }) => PivChild
}

export type SelectKitProps<T extends SelectableItem> = KitProps<SelectProps<T>>
/**
 * if for layout , don't render important content in Box
 */
export function Select<T extends SelectableItem>(rawProps: SelectKitProps<T>) {
  const { shadowProps, props, methods } = useKitProps(rawProps, { name: 'Select' })
  const { item, items } = useItems<T>({
    items: props.items,
    // FIXME: why ?
    defaultValue: props.defaultValue,
    getItemValue: methods.getItemValue, // FIXME: why type ?
    onChange: methods.onChange,
  })
  return (
    <Piv
      // render:self={renderAsHTMLSelect}
      class={props.name}
      shadowProps={shadowProps}
    >
      <Loop of={items}>{(i) => /* DEV */ 3}</Loop>
    </Piv>
  )
}
