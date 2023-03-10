import { KitProps, Piv, PivProps } from '../../../packages/piv'

export type BoxProps = KitProps<{}>

/**
 * if for layout , don't render important content in Box
 */
export function Box(props: PivProps) {
  /* ---------------------------------- props --------------------------------- */
  return <Piv class={Box.name} {...props} />
}
