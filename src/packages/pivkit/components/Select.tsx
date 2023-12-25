import { KitProps, useKitProps } from '../createKit'
import { Piv, renderAsHTMLHeader, renderAsHTMLSelect } from '../piv'

export type SelectProps<T> = {
  name?: string
  options?: T | { value: T; label?: string }[]
  value?: T
  defaultValue?: T
  onSelect?: (value: T) => void
}

export type SelectKitProps<T> = KitProps<SelectProps<T>>

/**
 * if for layout , don't render important content in Box
 */
export function Select<T>(rawProps: SelectKitProps<T>) {
  const { shadowProps, props } = useKitProps(rawProps, { name: 'Select' })
  return <Piv render:self={renderAsHTMLSelect} class={props.name} shadowProps={shadowProps}></Piv>
}
