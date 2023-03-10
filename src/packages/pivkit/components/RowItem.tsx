import { KitProps, Piv, useKitProps } from '../../../packages/piv'
import { JSXElement } from 'solid-js'

export type RowItemProps = KitProps<{
  suffix?: JSXElement
  prefix?: JSXElement
}>

/**
 * if for layout , don't render important content in Box
 */
export function RowItem(rawProps: RowItemProps) {
  const [props, pivProps] = useKitProps(rawProps)
  /* ---------------------------------- props --------------------------------- */
  return (
    <Piv shadowProps={pivProps} icss={{ display: 'flex', alignItems: 'center' }}>
      {props.prefix}
      <Piv icss={{ flex: 1 }}>{props.children}</Piv>
      {props.suffix}
    </Piv>
  )
}
