import { KitProps, Piv, useKitProps } from '../../../packages/piv'
import { JSXElement, createEffect } from 'solid-js'

export type RowItemProps = {
  suffix?: JSXElement
  prefix?: JSXElement
}

/**
 * if for layout , don't render important content in Box
 */
export function RowItem(rawProps: KitProps<RowItemProps>) {
  const { props } = useKitProps<RowItemProps>(rawProps)
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
