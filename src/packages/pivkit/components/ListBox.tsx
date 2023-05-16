import { Box } from '..'
import { KitProps, useKitProps } from '../../piv'

export type ListBoxController = {}

export type ListBoxProps = {}

/**
 * box for list
 */
export function ListBox(rawProps: KitProps<ListBoxProps, ListBoxController>) {
  const { props, loadController } = useKitProps(rawProps)
  return (
    <Box shadowProps={props} icss={{ height: '50dvh', overflow: 'scroll' }}>
      {props.children}
    </Box>
  )
}
