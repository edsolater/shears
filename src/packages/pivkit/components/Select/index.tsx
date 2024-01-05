import { iife, isExist } from '@edsolater/fnkit'
import { Accessor } from 'solid-js'
import { KitProps, useKitProps } from '../../createKit'
import { Piv, PivChild } from '../../piv'
import { buildPopover } from '../../plugins'
import { Box } from '../Boxes'
import { Loop } from '../Loop'
import { useItems } from './useItems'

type SelectableItem = unknown

type FaceItemEventUtils<T extends SelectableItem> = {
  item: Accessor<T | undefined>
  index: Accessor<number | undefined>
  /** use this, for it's value won't change if item's struct change */
  value: Accessor<string | number | undefined>
}
type ItemEventUtils<T extends SelectableItem> = {
  item: Accessor<T>
  index: Accessor<number>
  /** use this, for it's value won't change if item's struct change */
  value: Accessor<string | number>
  isSelected: Accessor<boolean>
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
  renderTriggerItem?(utils: FaceItemEventUtils<T>): PivChild
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
  const { plugins: popoverPlugins, state: popoverState } = buildPopover({ triggerBy: 'click', placement: 'bottom' }) // <-- run on define, not good
  const { item, items, index, utils } = useItems<T>({
    items: props.items,
    // FIXME: why ?
    defaultValue: props.defaultValue,
    getItemValue: methods.getItemValue, // FIXME: why type ?
    onChange: methods.onChange,
  })
  const renderItem = methods.renderItem ?? (({ value }) => <>{value()}</>)
  const renderTriggerItem = ((utils: FaceItemEventUtils<T>) =>
    methods.renderTriggerItem?.(utils) ??
    iife(() => {
      const i = utils.item()
      const idx = utils.index()
      const v = utils.value()
      return isExist(i) && isExist(idx) && isExist(v)
        ? renderItem({ item: () => i, index: () => idx, value: () => v, isSelected: () => false })
        : props.placeholder
    })) as NonNullable<SelectProps<T>['renderTriggerItem']>
  return (
    <>
      <Piv
        // render:self={renderAsHTMLSelect}
        class={props.name}
        shadowProps={shadowProps}
        plugin={popoverPlugins.trigger}
        icss={{ background: 'dodgerblue', minWidth: '3em', maxWidth: '12em', minHeight: '1em', borderRadius: '8px' }}
      >
        {renderTriggerItem({ item, index, value: () => utils.getItemValue(item()) })}
      </Piv>
      <Box plugin={popoverPlugins.panel}>
        <Loop of={items}>
          {(i, idx) =>
            renderItem({
              item: () => i,
              index: idx,
              value: () => utils.getItemValue(i),
              isSelected: () => i === item(),
            })
          }
        </Loop>
      </Box>
    </>
  )
}
