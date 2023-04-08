import { Piv, PivProps } from '../../../packages/piv'

export type BoxProps = {}

/**
 * if for layout , don't render important content in Box
 */
export function Box(props: PivProps) {
  /* ---------------------------------- props --------------------------------- */
  return <Piv class={Box.name} {...props} />
}
