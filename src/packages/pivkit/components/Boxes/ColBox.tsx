import { icss_col } from '../../icssBlocks'
import { KitProps, useKitProps } from '../../piv'
import { ICSSColOption } from '../../styles/icssBlocks'
import { getICSSFromProps } from '../../utils/getICSSFromProps'
import { Box } from './Box'

export type ColProps = {
  [K in keyof ICSSColOption as `icss:${K}`]?: ICSSColOption[K]
}
/**
 * if for layout , don't render important content in ColBox
 */
export function Col(rawProps: KitProps<ColProps>) {
  const { props, shadowProps } = useKitProps(rawProps, { name: 'ColBox' })
  const icssOption = getICSSFromProps(props)
  /* ---------------------------------- props --------------------------------- */
  return <Box icss={icss_col(icssOption)} shadowProps={shadowProps} />
}
