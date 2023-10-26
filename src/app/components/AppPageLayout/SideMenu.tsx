import { KitProps, useKitProps } from '../../../packages/pivkit'

export type AppPageLayout_SideMenuProps = {}
/**
 * for easier to code and read
 *
 * TEMP: add haveData to fix scrolling bug
 */
export function AppPageLayout_SideMenu(kitProps: KitProps<AppPageLayout_SideMenuProps>) {
  const { pathname } = 
  const isMobile = useAppSettings((s) => s.isMobile)
  const isInLocalhost = useAppSettings((s) => s.isInLocalhost)
  const sideMenuRef = useRef<HTMLDivElement>(null)
  const latestVersion = useAppVersion((s) => s.latest)
  const currentVersion = useAppVersion((s) => s.currentVersion)
  const inDev = useAppSettings((s) => s.inDev) // show dev logo

  useEffect(() => {
    if (!inClient) return
    setCssVarible(
      globalThis.document.documentElement,
      '--side-menu-width',
      sideMenuRef.current ? Math.min(sideMenuRef.current.clientWidth, sideMenuRef.current.clientHeight) : 0,
    )
  }, [sideMenuRef])

  return (
    <>
      <Col
        domRef={sideMenuRef}
        className={twMerge(
          `h-full overflow-y-auto w-56 mobile:w-64 mobile:rounded-tr-2xl mobile:rounded-br-2xl`,
          className,
        )}
        style={{
          background: isMobile
            ? 'linear-gradient(242.18deg, rgba(57, 208, 216, 0.08) 68.05%, rgba(57, 208, 216, 0.02) 86.71%), #0C0926'
            : undefined,
          boxShadow: isMobile ? '8px 0px 48px rgba(171, 196, 255, 0.12)' : undefined,
        }}
      >
        {isMobile && (
          <Row className='items-center justify-between p-6 mobile:p-4 mobile:pl-8'>
            <Link href='/'>
              <Image src='/logo/logo-with-text.svg' className={`mobile:scale-75 ${inDev ? 'hue-rotate-60' : ''}`} />
            </Link>
            <Icon
              size={isMobile ? 'sm' : 'md'}
              heroIconName='x'
              className='text-[rgba(57,208,216,0.8)] clickable clickable-mask-offset-2'
              onClick={onClickCloseBtn}
            />
          </Row>
        )}
        <Col className='grid grid-rows-[2fr,1fr,auto] flex-1 overflow-hidden'>
          <div className='shrink overflow-y-auto min-h-[120px] py-4 space-y-1 mobile:py-0 px-2 mr-2 mobile:ml-2 mb-2'>
            <LinkItem icon='/icons/entry-icon-swap.svg' href='/swap' isCurrentRoutePath={pathname === '/swap'}>
              Swap
            </LinkItem>
            <LinkItem
              icon='/icons/entry-icon-liquidity.svg'
              href='/liquidity/add'
              isCurrentRoutePath={pathname === '/liquidity/add'}
            >
              Liquidity
            </LinkItem>
            <LinkItem
              icon='/icons/entry-icon-concentrated-pools.svg'
              href='/clmm/pools'
              isCurrentRoutePath={pathname === '/clmm/pools'}
            >
              Concentrated
            </LinkItem>
            <LinkItem icon='/icons/entry-icon-pools.svg' href='/pools' isCurrentRoutePath={pathname === '/pools'}>
              Pools
            </LinkItem>
            <LinkItem icon='/icons/entry-icon-farms.svg' href='/farms' isCurrentRoutePath={pathname === '/farms'}>
              Farms
            </LinkItem>
            <LinkItem icon='/icons/entry-icon-staking.svg' href='/staking' isCurrentRoutePath={pathname === '/staking'}>
              Staking
            </LinkItem>
            <LinkItem icon='/icons/entry-icon-acceleraytor.svg' href='/acceleraytor/list'>
              AcceleRaytor
            </LinkItem>
          </div>

          <Col className='overflow-scroll no-native-scrollbar'>
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
          </Tooltip>
        </Col>
      </Col>
    </>
  )
}
