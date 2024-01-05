import { Accessor } from 'solid-js'
import { KitProps, useKitProps } from '../../createKit'
import { Piv, PivChild, renderAsHTMLSelect } from '../../piv'
import { useItems } from './useItems'

type SelectableItem = string

export type SelectProps<T extends SelectableItem> = {
  name?: string

  // variant?: 'filled' | 'filledFlowDark' | 'filledDark' | 'roundedFilledFlowDark' | 'roundedFilledDark'
  items?: T[]
  value?: T
  defaultValue?: T
  /** value is used in onChange, value is also used as key */
  getItemValue?: (item: T) => string | number
  onChange?(utils: { item: T; index: Accessor<number>; value: string | number }): void

  disabled?: boolean
  placeholder?: PivChild
  hasDivider?: boolean
  hasDownIcon?: boolean
  renderItem?(utils: { item: T; index: Accessor<number>; value: string | number }): PivChild
  /** if not spcified use renderItem */
  renderTriggerItem?(utils: { item: T; index: Accessor<number>; value: string | number }): PivChild
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
  const d = props.value
  const { item, allItems } = useItems<T>({
    items: props.items,
    // FIXME: why ? 
    defaultValue: props.defaultValue,
    // getItemValue: props.getItemValue,
    // onChange: props.onChange,
  })
  return <Piv render:self={renderAsHTMLSelect} class={props.name} shadowProps={shadowProps}></Piv>
}
