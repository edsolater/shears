import { KitProps, Piv, useKitProps } from '../piv'

export interface PanelProps {}

/** provide default icss */
export function Panel(rawProps: KitProps<PanelProps>) {
  const { props } = useKitProps(rawProps, { name: 'Panel' })
  /* ---------------------------------- props --------------------------------- */
  return <Piv shadowProps={props} />
}
