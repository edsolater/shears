import { Icon, KitProps, Row, Span, createICSS, cssOpacity, cssVar, useKitProps } from '../../../../../packages/pivkit'
import { Link } from '../../../../components/Link'

export type OptionItemBoxProps = {
  // NOTE: when start with 'visiable' this part of component can be shown, 🤔 just whether 'render:' exist is enough ?
  /** @default false */
  ['render:Arrow']?: boolean
  /** @default true */
  ['render:FaceIcon']?: boolean
  iconSrc?: string
  href?: string
}

const icssOptionItemBox = createICSS(() => ({
  display: 'block',
  paddingBlock: '0.75rem',
  paddingInline: '2rem',
  '&:hover': {
    backgroundColor: cssOpacity(cssVar('--ternary'), 0.1),
  },
  '&:active': {
    backgroundColor: cssOpacity(cssVar('--ternary'), 0.1),
  },
  cursor: 'pointer',
  position: 'relative',
}))

export function OptionItemBox(kitProps: KitProps<OptionItemBoxProps>) {
  const { props, shadowProps } = useKitProps(kitProps)
  return (
    <Link shadowProps={shadowProps} href={props.href} icss={icssOptionItemBox}>
      <Row>
        <Icon
          icss={{
            marginInlineEnd: '0.75rem',
            color: cssVar('--ternary'),
          }}
          size={'sm'}
          src={props.iconSrc}
        />
        <Span
          icss={{
            flexGrow: 1,
            color: cssVar('--ternary'),
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          {props.children}
        </Span>
        {/* TODO: add arrow */}
        {!props['render:Arrow'] && <Icon size={'sm'} />}
      </Row>
    </Link>
  )
}
