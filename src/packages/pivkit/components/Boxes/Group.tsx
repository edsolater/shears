import { KitProps, useKitProps } from '../../piv'
import { ICSSGridOption } from '../../styles/icssBlocks'
import { Box, BoxProps } from './Box'

export type GroupProps = BoxProps

/**
 * just render nothing
 */
export function Group(ktiProps: KitProps<GroupProps>) {
  const { shadowProps } = useKitProps(ktiProps, { name: 'Group' })
  /* ---------------------------------- props --------------------------------- */
  return <Box shadowProps={shadowProps} />
}
