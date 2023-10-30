import { Col, Icon, KitProps, Row, Span, cssOpacity, cssVar, useKitProps } from '../../../../packages/pivkit'
import { Link } from '../../../components/Link'

export function SideMenu_OptionItems() {
  return (
    <Col
      icss={{
        overflowY: 'scroll',
      }}
    >
      {/* divider */}
      {/* <div className='mx-8 border-b border-[rgba(57,208,216,0.16)] my-2 mobile:my-1'></div> */}

      <Col
        icss={{
          marginBlockTop: '0.5rem',
        }}
      >
        <OptionItem noArrow href='https://raydium.gitbook.io/raydium/' iconSrc='/icons/msic-docs.svg'>
          Docs
        </OptionItem>

        <OptionItem noArrow href='https://forms.gle/DvUS4YknduBgu2D7A' iconSrc='/icons/misc-feedback.svg'>
          Feedback
        </OptionItem>
      </Col>
      {/* <RpcConnectionPanelSidebarWidget /> */}
      {/* <SettingSidebarWidget />
           <CommunityPanelSidebarWidget /> */}
    </Col>
  )
}
type OptionItemOptions = {
  noArrow?: boolean
  iconSrc?: string
  href?: string
}

export function OptionItem(kitProps: KitProps<OptionItemOptions>) {
  const { props, shadowProps } = useKitProps(kitProps)
  return (
    <Link
      shadowProps={shadowProps}
      href={props.href}
      icss={{
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
      }}
    >
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
        {!props.noArrow && <Icon size={'sm'} />}
      </Row>
    </Link>
  )
}
