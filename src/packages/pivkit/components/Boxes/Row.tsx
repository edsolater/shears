import { KitProps, useKitProps } from '../../piv'
import { ICSSRowOption, icssRow } from '../../styles/icssBlocks'
import { getICSSFromProps } from '../../utils/getICSSFromProps'
import { Box, BoxProps } from './Box'

export type RowProps = {
  [K in keyof ICSSRowOption as `icss:${K}`]?: ICSSRowOption[K]
} & BoxProps

/**
 * if for layout , don't render important content in Row
 */
export function Row(kitProps: KitProps<RowProps>) {
  const { shadowProps, props } = useKitProps(kitProps, { name: 'Row' })
  const icssOption = getICSSFromProps(props)
  /* ---------------------------------- props --------------------------------- */
  return <Box icss={icssRow(icssOption)} shadowProps={shadowProps} />
}
