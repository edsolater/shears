import { Col, Grid, KitProps } from '../../../../packages/pivkit'
import { NavLinkItems } from './NavigationItems'
import { OptionAdditionalItems } from './OptionAdditionalItems'

/**
 * for easier to code and read
 */
export type NavSideMenuProps = {}

export function NavSideMenu(kitProps: KitProps<NavSideMenuProps>) {
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
            height: '100%',
          }}
        >
          <NavLinkItems />

          <OptionAdditionalItems />

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
