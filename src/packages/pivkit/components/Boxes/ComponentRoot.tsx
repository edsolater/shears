import { KitProps, useKitProps } from '../../piv'
import { Box, BoxProps } from './Box'

export type ComponentRootProps = BoxProps & {}

/**
 * component root, often used as a Root of Component
 */
export function ComponentRoot(kitProps: KitProps<ComponentRootProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'ComponentRoot' })
  /* ---------------------------------- props --------------------------------- */
  return <Box shadowProps={shadowProps} />
}
