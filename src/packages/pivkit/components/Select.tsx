import { KitProps, useKitProps } from '../createKit'
import { Piv, PivChild, renderAsHTMLSelect } from '../piv'

export type SelectProps<T> = {
  name?: string
  // variant?: 'filled' | 'filledFlowDark' | 'filledDark' | 'roundedFilledFlowDark' | 'roundedFilledDark'
  renderFacePrefix?: (payloads: { open: boolean; item?: T }) => PivChild
  items?: T[]
  value?: T
  defaultValue?: T
  disabled?: boolean
  onChange?(item: T): void
  renderItem?(item?: T, idx?: number): PivChild
  /** if not spcified use renderItem */
  renderTriggerItem?(item?: T): PivChild

  getKey?(item: T): string | number
  placeholder?: PivChild
  hasDivider?: boolean
  hasDownIcon?: boolean
}

export type SelectKitProps<T> = KitProps<SelectProps<T>>

/**
 * if for layout , don't render important content in Box
 */
export function Select<T>(rawProps: SelectKitProps<T>) {
  const { shadowProps, props, pureProps } = useKitProps(rawProps, { name: 'Select' })
  const {} = useItems()
  return <Piv render:self={renderAsHTMLSelect} class={props.name} shadowProps={shadowProps}></Piv>
}

function useItems() {
  return {}
}
