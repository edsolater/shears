import { KitProps, useKitProps } from '../../createKit'
import { PivProps, Piv } from '../../piv'

export interface ContainerProps {}

/**
 * set css container for containerQuery
 */
export function Container(kitProps: KitProps<PivProps>) {
  const { shadowProps } = useKitProps(kitProps, { name: 'Container' })
  /* ---------------------------------- props --------------------------------- */
  return <Piv icss={{ container: 'Container / size' }} shadowProps={shadowProps} />
}
