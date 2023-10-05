import { isObject } from '@edsolater/fnkit'
import { KitProps, useKitProps } from '../../piv'
import { ICSSGridItemOption, ICSSGridOption, icssGrid } from '../../styles/icssBlocks'
import { Box, BoxProps } from './Box'

export type GridBoxProps = {
  /** options for icss_grid() */
  'icss:grid'?: boolean | ICSSGridOption
} & BoxProps

/**
 * if for layout , don't render important content in GridBox
 */
export function GridBox(rawProps: KitProps<GridBoxProps>) {
  const { shadowProps, props } = useKitProps(rawProps, { name: 'GridBox' })
  /* ---------------------------------- props --------------------------------- */
  return (
    <Box
      class='GridBox'
      shadowProps={shadowProps}
      icss={[icssGrid(isObject(props['icss:grid']) ? props['icss:grid'] : {})]}
    />
  )
}

export type GridItemBoxProps = {
  'icss:area'?: ICSSGridItemOption['area']
} & BoxProps

/**
 * for direct sub component of `<GridBox>`
 * @deprecated no , should use `<Box icss={{gridArea: 'xxx'}} />` instead
 */
export function GridItem(rawProps: KitProps<GridItemBoxProps>) {
  const { shadowProps, props } = useKitProps(rawProps, { name: 'GridItemBox' })
  return <Box shadowProps={shadowProps} icss={{ gridArea: props['icss:area'] }} />
}
