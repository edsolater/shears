import { Col, Grid, KitProps } from '../../../packages/pivkit'
import { SideMenu_Links } from './SideMenu_Links'

/**
 * for easier to code and read
 */
export type AppPageLayout_SideMenuProps = {}
export function AppPageLayout_SideMenu(kitProps: KitProps<AppPageLayout_SideMenuProps>) {
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
          <SideMenu_Links />

          {/* <Col icss={{
            overflowY:'scroll', 
          }}>
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
          </Col> */}

          {/* <Tooltip>
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
