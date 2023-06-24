import { Box } from '..'
import { KitProps, useKitProps } from '../../piv'

export interface ListContainerBoxProps {
  dir?: 'x' | 'y'
}

export interface ListContainerBoxController {}

export type DefaultListContainerBoxProps = typeof defaultProps

const defaultProps = {
  dir: 'y',
} as const satisfies Partial<ListContainerBoxProps>

/**
 * box for list
 * @deprecated , just use {@link List}
 */
export function ListContainerBox(rawProps: KitProps<ListContainerBoxProps, ListContainerBoxController>) {
  const { props, lazyLoadController } = useKitProps(rawProps, { defaultProps })
  return (
    <Box
      shadowProps={props}
      icss={[
        props.dir === 'x' ? { overflowY: 'hidden', overflowX: 'scroll' } : { overflowY: 'scroll', overflowX: 'hidden' },
      ]}
    >
      {props.children}
    </Box>
  )
}
