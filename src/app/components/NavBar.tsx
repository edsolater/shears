import { createEffect, createSignal } from 'solid-js'
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
import { useURL } from '../hooks/useURL'
import { threeGridSlotBoxICSS } from '../icssBlocks/threeGridSlotBoxICSS'
import { store } from '../stores/data/store'
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
        icss={[{ padding: '8px', borderRadius: '8px' }, icss_clickable]}
        // onClick={() => {
        //   appSettingsModalControllers()?.open()
        // }}
      >
        ⚙️
      </Box>
      <SettingsContent />
    </Fragnment>
  )
}

const [appSettingsModalControllers, setSettingControllerRef] = createControllerRef<ModalController>()

/**
 * modal
 */
function SettingsPanelDialog() {
  return (
    <Modal controllerRef={setSettingControllerRef} open>
      <SettingsContent />
    </Modal>
  )
}

/**
 * setting form details
 */
function SettingsContent() {
  const [tempUrl, setTempUrl] = createSignal(store.rpcUrl)
  const { isValid, origin } = useURL(tempUrl)
  createEffect(() => {
    console.log('origin: ', origin())
  })
  createEffect(() => {
    console.log('isValid: ', isValid())
  })
  createEffect(() => {
    console.log('tempUrl: ', tempUrl())
  })
  return (
    <Box>
      <Section>
        <ItemBox>
          <Text>RPC:</Text>
          <Input
            value={store.rpcUrl}
            onInput={({ text }) => {
              setTempUrl(text)
            }}
            icss={{ borderStyle: 'solid', borderColor: isValid() ? 'green' : 'crimson' }}
          />
        </ItemBox>
      </Section>
    </Box>
  )
}


