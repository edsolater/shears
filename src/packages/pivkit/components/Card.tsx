import { KitProps, Piv, useKitProps } from '../../piv'

export interface CardProps {}

/** provide default icss */
export function Card(rawProps: KitProps<CardProps>) {
  const { props } = useKitProps(rawProps)
  /* ---------------------------------- props --------------------------------- */
  return <Piv class={Card.name} shadowProps={props} />
}
