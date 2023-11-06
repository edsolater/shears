import { AnyFn, isFunction, isObject } from '@edsolater/fnkit'
import { switchCase } from '../../../../../packages/fnkit'
import {
  Box,
  Icon,
  KitProps,
  PivChild,
  Row,
  Span,
  createICSS,
  cssOpacity,
  cssVar,
  useKitProps,
} from '../../../../../packages/pivkit'
import { Link } from '../../../../components/Link'

export type OptionItemBoxProps = {
  /** @default true */
  ['render:dot']?: boolean | PivChild | (() => PivChild)
  // NOTE: when start with 'visiable' this part of component can be shown, 🤔 just whether 'render:' exist is enough ?
  /** @default false */
  ['render:arrow']?: boolean | PivChild | (() => PivChild)
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
  const { props, shadowProps } = useKitProps(kitProps, {
    defaultProps: { ['render:arrow']: true, ['render:dot']: true },
  })
  const subComponentsRender = {
    dot: () => (
      <Box
        icss={[
          { display: 'grid', placeItems: 'center' },
          { width: '1rem', height: '1rem', marginInlineEnd: '0.75rem', color: cssVar('--ternary') },
        ]}
      >
        {switchCase(
          props['render:dot'],
          [
            [(v) => isObject(v), (v) => v],
            [(v) => isFunction(v), (v: AnyFn) => v()],
            [(v) => v === true, () => <Icon src={props.iconSrc} />],
          ],
          null,
        )}
      </Box>
    ),
    arrow: () =>
      /* TODO: add arrow */ switchCase(
        props['render:arrow'],
        [
          [(v) => isObject(v), (v) => v],
          [(v) => isFunction(v), (v: AnyFn) => v()],
          [
            (v) => v === true,
            () => <Icon icss={{ marginInlineEnd: '0.75rem', color: cssVar('--ternary') }} size={'sm'} />,
          ],
        ],
        null,
      ),
  }

  return (
    <Link shadowProps={shadowProps} href={props.href} icss={icssOptionItemBox}>
      <Row>
        {subComponentsRender.dot()}
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
        {subComponentsRender.arrow()}
      </Row>
    </Link>
  )
}
