import { Box } from '..'
import { KitProps, useKitProps } from '../../piv'

export type ListContainerBoxProps = {
  dir?: 'x' | 'y'
}

export type ListContainerBoxController = {}

export type DefaultListContainerBoxProps = typeof defaultProps

const defaultProps = {
  dir: 'y'
} as const satisfies Partial<ListContainerBoxProps>
/**
 * box for list
 */
export function ListContainerBox(rawProps: KitProps<ListContainerBoxProps, ListContainerBoxController>) {
  const { props, lazyLoadController } = useKitProps(rawProps, { defaultProps })
  return (
    <Box
      shadowProps={props}
      icss={[
        { height: '50dvh' },
        props.dir === 'x' ? { overflowY: 'hidden', overflowX: 'scroll' } : { overflowY: 'scroll', overflowX: 'hidden' }
      ]}
    >
      {props.children}
    </Box>
  )
}
