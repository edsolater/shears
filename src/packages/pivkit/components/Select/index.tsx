import { isExist } from '@edsolater/fnkit'
import { Accessor, createEffect } from 'solid-js'
import { DeKitProps, KitProps, useKitProps } from '../../createKit'
import { AddDefaultPivProps, ClickController, Piv, PivChild } from '../../piv'
import { buildPopover, useKeyboardShortcut } from '../../plugins'
import { icss_cardPanel, icss_clickable, icss_focusDetector, icss_row } from '../../styles'
import { Box } from '../Boxes'
import { ItemBox } from '../ItemBox'
import { Loop } from '../Loop'
import { useItems } from './useItems'
import { createDomRef, useClickOutside } from '../../hooks'

type SelectableItem = unknown

type FaceItemEventUtils<T extends SelectableItem> = {
  item: Accessor<T | undefined>
  index: Accessor<number | undefined>
  /** use this, for it's value won't change if item's struct change */
  value: Accessor<string | number | undefined>
  triggerIsOpen: Accessor<boolean>
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
  renderTriggerItemArrow?: (payloads: { open: Accessor<boolean> }) => PivChild
  renderFacePrefix?: (payloads: {
    open: Accessor<boolean>
    item: T
    index: Accessor<number>
    value: string | number
  }) => PivChild
  selectWrapperBoxProps?: PivChild
  selectListBoxProps?: PivChild
  selectListItemBoxProps?: PivChild
}

export type SelectKitProps<T extends SelectableItem> = KitProps<SelectProps<T>>
/**
 * if for layout , don't render important content in Box
 */
export function Select<T extends SelectableItem>(rawProps: SelectKitProps<T>) {
  const { shadowProps, props, methods } = useKitProps(rawProps, { name: 'Select' })

  const { dom: selectFaceDom, setDom: setSelectFaceDom } = createDomRef()
  const { dom: selectListDom, setDom: setSelectListDom } = createDomRef()

  const { item, items, index, utils, setItem, focusItem, selectPrevItem, selectNextItem } = useItems<T>({
    items: props.items,
    defaultValue: props.defaultValue,
    getItemValue: methods.getItemValue,
    onChange: methods.onChange,
  })

  const { plugins: popoverPlugins, state: popoverState } = buildPopover({ triggerBy: 'click', placement: 'bottom' }) // <-- run on define, not good

  const { renderTriggerItem, renderItem, renderTriggerItemArrow } = buildRenderFunction<T>(methods, props)

  useKeyboardShortcut(
    selectListDom,
    {
      'close': {
        fn: () => popoverState.close(),
        keyboardShortcut: 'Escape',
      },
      'select confirm': {
        fn: () => {
          //TODO: do with focusItem
        },
        keyboardShortcut: 'Enter',
      },
      'select prev item': {
        fn: () => selectPrevItem(),
        keyboardShortcut: 'ArrowUp',
      },
      'select next item': {
        fn: () => {
          console.log('select next item')
          return selectNextItem()
        },
        keyboardShortcut: 'ArrowDown',
      },
      'TEST': {
        fn: () => {
          console.log('TEST')
        },
        keyboardShortcut: 't',
      },
    },
    { disabled: popoverState.isTriggerOn },
  )

  // auto focus when open
  createEffect(() => {
    if (popoverState.isTriggerOn()) {
      selectListDom()?.focus()
    }
  })

  // auto-focus this first item

  const onItemClick = (clickController: ClickController, i: T) => {
    setItem(i)
    popoverState.close()
  }

  useClickOutside(selectFaceDom, {
    enabled: popoverState.isTriggerOn,
    onClickOutSide: () => popoverState.close(),
  })

  return (
    <>
      <Piv
        // render:self={renderAsHTMLSelect}
        domRef={setSelectFaceDom}
        class={props.name}
        shadowProps={[shadowProps, props.selectWrapperBoxProps]}
        plugin={popoverPlugins.trigger}
        icss={[
          { background: '#000', minWidth: '3em', maxWidth: '12em', minHeight: '1lh', borderRadius: '8px' },
          icss_row({}), //FIXME: 💩 why type is ANY?
        ]}
      >
        {renderTriggerItem({
          item,
          index,
          value: () => utils.getItemValue(item()),
          triggerIsOpen: popoverState.isTriggerOn,
        })}
      </Piv>
      <Box
        domRef={setSelectListDom}
        shadowProps={props.selectListBoxProps}
        plugin={popoverPlugins.panel}
        icss={[icss_cardPanel, icss_focusDetector, { padding: 'revert', paddingBlock: '8px' }]}
      >
        <Loop of={items}>
          {(i, idx) => (
            <ItemBox
              shadowProps={props.selectListItemBoxProps}
              onClick={(c) => onItemClick(c, i)}
              icss={[icss_clickable, { paddingInline: '16px' }]}
            >
              {renderItem({
                item: () => i,
                index: idx,
                value: () => utils.getItemValue(i),
                isSelected: () => i === item(),
              })}
            </ItemBox>
          )}
        </Loop>
      </Box>
    </>
  )
}

function buildRenderFunction<T extends SelectableItem>(
  methods: AddDefaultPivProps<SelectKitProps<T>, {}>,
  props: DeKitProps<SelectKitProps<T>>,
) {
  const renderItem = methods.renderItem ?? (({ value }) => <>{value()}</>)
  const renderTriggerItem =
    methods.renderTriggerItem ??
    (((utils: FaceItemEventUtils<T>) => {
      const i = utils.item()
      const idx = utils.index()
      const v = utils.value()
      return isExist(i) && isExist(idx) && isExist(v)
        ? renderItem({ item: () => i, index: () => idx, value: () => v, isSelected: () => true })
        : props.placeholder
    }) as NonNullable<SelectProps<T>['renderTriggerItem']>)
  const renderTriggerItemArrow = methods.renderTriggerItemArrow ?? (() => <>{'>'}</>)
  return { renderTriggerItem, renderItem, renderTriggerItemArrow }
}
