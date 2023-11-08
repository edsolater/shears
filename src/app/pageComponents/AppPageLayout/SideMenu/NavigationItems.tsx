import { createMemo } from 'solid-js'
import {
  Accessify,
  Box,
  Col,
  Icon,
  KitProps,
  Piv,
  Row,
  cssOpacity,
  cssVar,
  useKitProps,
} from '../../../../packages/pivkit'
import { usePageMatcher } from '../../../routes'
import { Link } from '../../../components/Link'

export function NavLinkItems() {
  const pageMatcher = usePageMatcher()
  return (
    <Col
      icss:gap='0.25rem'
      icss={{
        overflowY: 'auto',
        paddingBlock: '1rem',
        paddingInline: '0.5rem',
        marginInlineEnd: '0.5rem',
        marginBlockEnd: '0.5rem',
      }}
    >
      <LinkItem icon='/icons/entry-icon-swap.svg' href='/swap' isCurrentRoutePath={pageMatcher.isSwapPage}>
        Swap
      </LinkItem>
      <LinkItem icon='/icons/entry-icon-pools.svg' href='/pools' isCurrentRoutePath={pageMatcher.isPairsPage}>
        Pools
      </LinkItem>
      <LinkItem icon='/icons/entry-icon-farms.svg' href='/farms' isCurrentRoutePath={pageMatcher.isFarmsPage}>
        Farms
      </LinkItem>
    </Col>
  )
}
type LinkItemProps = {
  href?: string
  icon?: string
  isCurrentRoutePath?: boolean
  children?: Accessify<string>
}
function LinkItem(kitProps: KitProps<LinkItemProps>) {
  const { props } = useKitProps(kitProps)
  const isInnerLink = createMemo(() => props.href?.startsWith('/'))
  const isExternalLink = () => !isInnerLink
  return (
    <Link
      href={props.href}
      innerRoute={isInnerLink}
      icss={{
        paddingBlock: '0.5rem',
        paddingInline: '1rem',
        borderRadius: '0.5rem',
        transition: '150ms',

        background: props.isCurrentRoutePath ? cssOpacity(cssVar('--ternary'), 0.1) : 'transparent',
        '&:hover': {
          background: cssOpacity(cssVar('--ternary'), 0.1),
        },
      }}
    >
      <Row>
        <Box
          icss={{
            display: 'grid',
            bg: `linear-gradient(135deg, ${cssOpacity(cssVar('--ternary'), 0.2)}, transparent)`,
            borderRadius: '0.5rem',
            padding: '0.375rem',
            marginRight: '0.75rem',
          }}
        >
          <Icon size={'sm'} src={props.icon} />
        </Box>
        <Row
          icss={{
            flexGrow: 1,
            justifyContent: 'space-between',
            color: props.isCurrentRoutePath ? cssVar('--ternary') : cssVar('--ternary-pale'),
            transition: '80ms',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          <Piv icss={{ marginBlock: 'auto' }}>{props.children}</Piv>
          {isExternalLink() && <Icon icss={{ display: 'inline', opacity: '.8' }} size={'sm'} />}
        </Row>
      </Row>
    </Link>
  )
}
