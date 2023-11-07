import { Col } from '../../../../../packages/pivkit'
import { OptionItemBox } from './OptionItem'
import { RpcItemFace } from './RpcOptionSetting'

export function SideMenu_OptionItems() {
  return (
    <Col
      icss={{
        overflowY: 'scroll',
      }}
    >
      {/* divider */}
      {/* <div className='mx-8 border-b border-[rgba(57,208,216,0.16)] my-2 mobile:my-1'></div> */}
      <RpcItemFace />

      <Col icss={{ marginBlockTop: '0.5rem' }}>
        <OptionItemBox render:arrow href='https://raydium.gitbook.io/raydium/' iconSrc='/icons/msic-docs.svg'>
          Docs
        </OptionItemBox>

        <OptionItemBox render:arrow href='https://forms.gle/DvUS4YknduBgu2D7A' iconSrc='/icons/misc-feedback.svg'>
          Feedback
        </OptionItemBox>
      </Col>
      {/* <SettingSidebarWidget /> */}
      {/* <CommunityPanelSidebarWidget /> */}
    </Col>
  )
}
