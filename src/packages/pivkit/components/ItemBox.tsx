import { JSXElement } from 'solid-js'
import { KitProps, Piv, useKitProps } from '../piv'

export interface ItemBoxProps {
  suffix?: JSXElement
  prefix?: JSXElement
}

export type ItemBoxKitProps = KitProps<ItemBoxProps>

/**
 * if for layout , don't render important content in Box
 */
export function ItemBox(rawProps: ItemBoxKitProps) {
  const { props } = useKitProps(rawProps, { name: 'ItemBox' })
  /* ---------------------------------- props --------------------------------- */
  return (
    <Piv shadowProps={props} icss={{ display: 'flex', alignItems: 'center' }}>
      {props.prefix}
      {/* TODO: porps.children should be normal  */}
      <>{props.children}</>
      {props.suffix}
    </Piv>
  )
}
