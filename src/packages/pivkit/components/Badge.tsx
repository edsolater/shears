import { KitProps, useKitProps } from '../createKit'
import { PivChild, Piv } from '../piv'
import { cssOpacity, cssColorMix } from '../styles'
import { Row } from './Boxes'

type BadgeType = {
  noOutline?: boolean
  /** default: outline */
  type?: 'solid' | 'outline'
  /** default 'md' */
  size?: 'md' | 'sm'
  /** usually, it appear with onClick */
  hoverChildren?: PivChild
}

export function Badge(kitProps: KitProps<BadgeType>) {
  const { props, shadowProps } = useKitProps(kitProps)
  const defaultSize = props.size ?? 'md'
  return (
    <Row
      line
      icss={{
        backgroundColor: 'transparent',
        '&:hover': {
          backgroundColor: cssOpacity('currentColor', 0.1),
        },
        borderRadius: '1rem',
        border: `solid ${cssColorMix('currentColor', '#5ac4be', 0.5)}`,
        padding: '0.1rem .5rem',
        lineHeight: '1',
      }}
      shadowProps={shadowProps}
    >
      {props.hoverChildren && (
        <Piv class='absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300'>
          {props.hoverChildren}
        </Piv>
      )}
      <Piv
        class={props.hoverChildren ? 'group-hover:opacity-0 transition duration-300' : undefined}
        icss={{ fontSize: '.75em' }}
      >
        {props.children}
      </Piv>
    </Row>
  )
}
