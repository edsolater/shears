import { Piv, PivProps } from '../../piv'

export type CardProps = {}

/** provide default icss */
export function Card(props: PivProps) {
  /* ---------------------------------- props --------------------------------- */
  return <Piv class={Card.name} {...props} />
}
