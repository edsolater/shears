import {
  Box,
  Fragnment,
  Input,
  ItemBox,
  Modal,
  ModalController,
  Section,
  Text,
  createControllerRef,
  icss_clickable,
  icss_row,
} from '../../packages/pivkit'
import { useControllerRef } from '../../packages/pivkit/hooks/useControllerRef'
import { threeGridSlotBoxICSS } from '../icssBlocks/threeGridSlotBoxICSS'
import { setStore, store } from '../stores/data/store'
import { AppLogo } from './AppLogo'
import { NavWrapBox, NavWrapBoxProps } from './NavWrapBox'
import { RoutesButtons } from './RoutesButtons'
import { WalletWidget } from './WalletWidget'

export type NavBarProps = NavWrapBoxProps

export function NavBar(props: NavBarProps) {
  return (
    <NavWrapBox title={props.title}>
      <Box icss={threeGridSlotBoxICSS}>
        <AppLogo title={props.title}></AppLogo>

        {/* tabs */}
        <RoutesButtons />

        <ItemBox icss={icss_row}>
          <SettingButtonTrigger />
          <WalletWidget />
        </ItemBox>
      </Box>
    </NavWrapBox>
  )
}

/**
 * triggers
 */
function SettingButtonTrigger() {
  return (
    <Fragnment>
      <Box
        icss={[{ padding: '8px', marginInline: '8px', borderRadius:'8px' }, icss_clickable]}
        onClick={() => {
          appSettingsModalControllers()?.open()
        }}
      >
        ⚙️
      </Box>
      <SettingsPanelDialog></SettingsPanelDialog>
    </Fragnment>
  )
}

const [appSettingsModalControllers, setSettingControllerRef] = createControllerRef<ModalController>()

/**
 * modal
 */
function SettingsPanelDialog() {
  return (
    <Modal controllerRef={setSettingControllerRef}>
      <SettingsContent />
    </Modal>
  )
}

/**
 * setting form details
 */
function SettingsContent() {
  return (
    <Box>
      <Section>
        <ItemBox>
          <Text>RPC:</Text>
          <Input
            value={store.rpcUrl}
            onInput={({ text }) => {
              setStore({ rpcUrl: text })
            }}
          />
        </ItemBox>
      </Section>
    </Box>
  )
}
