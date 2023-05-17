import { Box } from '..'
import { KitProps, useKitProps } from '../../piv'

export type ListContainerBoxController = {}

export type ListContainerBoxProps = {}

/**
 * box for list
 */
export function ListContainerBox(rawProps: KitProps<ListContainerBoxProps, ListContainerBoxController>) {
  const { props, loadController } = useKitProps(rawProps)
  return (
    <Box shadowProps={props} icss={{ height: '50dvh', overflow: 'scroll' }}>
      {props.children}
    </Box>
  )
}
