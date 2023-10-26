import { KitProps, useKitProps } from '../../piv'
import { ICSSGridOption } from '../../styles/icssBlocks'
import { Box, BoxProps } from './Box'

export type MainProps = BoxProps

/**
 * just render nothing
 */
export function Main(ktiProps: KitProps<MainProps>) {
  const { shadowProps } = useKitProps(ktiProps, { name: 'Main' })
  /* ---------------------------------- props --------------------------------- */
  return <Box shadowProps={shadowProps} />
}
