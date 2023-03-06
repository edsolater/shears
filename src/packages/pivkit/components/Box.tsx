import { Piv, PivProps } from '@edsolater/piv'

export type BoxProps = PivProps

/**
 * if for layout , don't render important content in Box
 */
export function Box(props: PivProps) {
  /* ---------------------------------- props --------------------------------- */
  return <Piv class={Box.name} {...props} />
}