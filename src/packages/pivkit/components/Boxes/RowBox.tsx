import { KitProps, useKitProps } from '../../piv'
import { ICSSGridOption } from '../../styles/icssBlocks'
import { Box, BoxProps } from './Box'

export type RowBoxProps = {
  'icss:grid'?: boolean | ICSSGridOption
} & BoxProps

/**
 * if for layout , don't render important content in RowBox
 */
export function RowBox(rawProps: KitProps<RowBoxProps>) {
  const { shadowProps } = useKitProps(rawProps, { name: 'RowBox' })
  /* ---------------------------------- props --------------------------------- */
  return <Box class='RowBox' shadowProps={shadowProps} />
}
