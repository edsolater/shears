import { mergeObjects } from '@edsolater/fnkit'
import { KitProps, useKitProps } from '../../createKit'
import { ICSSRowOption, icss_row } from '../../styles/icssRules'
import { getICSSFromProps } from '../../utils/getICSSFromProps'
import { Box, BoxProps } from './Box'

export type RowProps = {
  /* the same as `icss:align='center'` */
  line?: boolean
} & {
  [K in keyof ICSSRowOption as `icss:${K}`]?: ICSSRowOption[K]
} & BoxProps

/**
 * if for layout , don't render important content in Row
 */
export function Row(kitProps: KitProps<RowProps>) {
  const { shadowProps, props } = useKitProps(kitProps, { name: 'Row' })
  const icss_option = getICSSFromProps(props)
  /* ---------------------------------- props --------------------------------- */
  return (
    <Box
      icss={props.line ? icss_row(mergeObjects(icss_option, { align: 'center' })) : icss_row(icss_option)}
      shadowProps={shadowProps}
    />
  )
}
