import { createMemo } from 'solid-js'
import { Accessify, Box, Col, Grid, Icon, KitProps, Piv, Row, useKitProps } from '../../../packages/pivkit'
import { usePageMatcher } from '../../routes'
import { Link } from '../../components/Link'

export type AppPageLayout_SideMenuProps = {}
/**
 * for easier to code and read
 *
 * TEMP: add haveData to fix scrolling bug
 */
export function AppPageLayout_SideMenu(kitProps: KitProps<AppPageLayout_SideMenuProps>) {
  const pageMatcher = usePageMatcher()

  return (
    <>
      <Col
        icss={{
          height: '100%',
          width: '16rem',
          overflowY: 'auto',
        }}
      >
        <Grid
          icss={{
            gridTemplateRows: '2fr 1fr auto',
            overflow: 'hidden',
          }}
        >
          <Col
            icss:gap='0.25rem'
            icss={{
              overflowY: 'auto',
              height: 'max(120px, 9999vh)',
              paddingBlock: '1rem',
              paddingInline: '0.5rem',
              marginInlineEnd: '0.5rem',
              marginBlockEnd: '0.5rem',
            }}
          >
            <LinkItem icon='/icons/entry-icon-swap.svg' href='/swap' isCurrentRoutePath={pageMatcher.isSwapPage}>
              Swap
            </LinkItem>
            {/* <LinkItem
              icon='/icons/entry-icon-liquidity.svg'
              href='/liquidity/add'
              isCurrentRoutePath={pageMatcher.isSwapPage}
            >
              Liquidity
            </LinkItem> */}
            {/* <LinkItem
              icon='/icons/entry-icon-concentrated-pools.svg'
              href='/clmm/pools'
              isCurrentRoutePath={pathname === '/clmm/pools'}
            >
              Concentrated
            </LinkItem> */}
            <LinkItem icon='/icons/entry-icon-pools.svg' href='/pools' isCurrentRoutePath={pageMatcher.isPairsPage}>
              Pools
            </LinkItem>
            <LinkItem icon='/icons/entry-icon-farms.svg' href='/farms' isCurrentRoutePath={pageMatcher.isFarmsPage}>
              Farms
            </LinkItem>
            {/* <LinkItem icon='/icons/entry-icon-staking.svg' href='/staking' isCurrentRoutePath={pathname === '/staking'}>
              Staking
            </LinkItem>
            <LinkItem icon='/icons/entry-icon-acceleraytor.svg' href='/acceleraytor/list'>
              AcceleRaytor
            </LinkItem> */}
          </Col>

          {/* <Col className='overflow-scroll no-native-scrollbar'>
            <div className='mx-8 border-b border-[rgba(57,208,216,0.16)] my-2 mobile:my-1'></div>
            <div className='flex-1 overflow-auto no-native-scrollbar mt-2'>
              <RpcConnectionPanelSidebarWidget />
              <SettingSidebarWidget />
              <CommunityPanelSidebarWidget />

              <OptionItem noArrow href='https://raydium.gitbook.io/raydium/' iconSrc='/icons/msic-docs.svg'>
                Docs
              </OptionItem>

              <OptionItem noArrow href='https://v1.raydium.io/swap' heroIconName='desktop-computer'>
                Raydium V1
              </OptionItem>

              <OptionItem noArrow href='https://forms.gle/DvUS4YknduBgu2D7A' iconSrc='/icons/misc-feedback.svg'>
                Feedback
              </OptionItem>
            </div>
          </Col>

          <Tooltip>
            <div className='text-sm mobile:text-xs m-2 mb-0 leading-relaxed opacity-50 hover:opacity-100 transition font-medium text-[#abc4ff] whitespace-nowrap cursor-default'>
              <div>V {currentVersion.slice(1)}</div>
              <div>
                <BlockTimeClock />
              </div>
            </div>
            <Tooltip.Panel>
              <div className='text-xs m-2 leading-relaxed font-medium text-[#abc4ff] whitespace-nowrap cursor-default'>
                <div>Current: {currentVersion}</div>
                <div>Latest: {latestVersion}</div>
                <div>Block time: {<BlockTimeClock showSeconds />}</div>
              </div>
            </Tooltip.Panel>
          </Tooltip> */}
        </Grid>
      </Col>
    </>
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
      }}
    >
      <Row>
        <Box
          icss={{
            display: 'grid',
            bg: 'linear-gradient(135deg, rgba(57,208,216,0.2) 0%, rgba(57,208,216,0) 100%)',
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
            color: props.isCurrentRoutePath ? 'rgba(57,208,216,1)' : '#ACE3E5',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          <Piv>{props.children}</Piv>
          {isExternalLink() && (
            <Icon icss={{ display: 'inline', opacity: '.8' }} size={'sm'} />
          )}
        </Row>
      </Row>
    </Link>
  )
}
