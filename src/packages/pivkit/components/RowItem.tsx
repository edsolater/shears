import { KitProps, Piv, PivProps, useKitProps } from '@edsolater/piv'
import { JSXElement } from 'solid-js'

export type RowItemProps = KitProps<{
  suffix?: JSXElement
  prefix?: JSXElement
}>

/**
 * if for layout , don't render important content in Box
 */
export function RowItem(rawProps: RowItemProps) {
  const props = useKitProps(rawProps)
  /* ---------------------------------- props --------------------------------- */
  return (
    <Piv shadowProps={props} icss={{ display: 'flex', alignItems: 'center' }}>
      {props.prefix}
      <Piv icss={{ flex: 1 }}>{props.children}</Piv>
      {props.suffix}
    </Piv>
  )
}
