import { Accessor, createEffect } from 'solid-js'
import {
  Accessify,
  Box,
  Fragnment,
  Input,
  ItemBox,
  Modal,
  ModalController,
  Row,
  Section,
  Text,
  createControllerRef,
  icssClickable,
  createFormField,
} from '@edsolater/pivkit'
import { useInputController } from '@edsolater/pivkit'
import { store } from '../../../stores/data/store'
import { parseUrl } from '../../../utils/parseUrl'
import { AppLogo } from '../../../components/AppLogo'
import { WalletWidget } from '../../../components/WalletWidget'
import { NaBar_NavWrapBox, NaBar_NavWrapBoxProps } from './NavWrapBox'

export type AppPageLayout_NavBarProps = NaBar_NavWrapBoxProps

export function AppPageLayout_NavBar(props: AppPageLayout_NavBarProps) {
  return (
    <NaBar_NavWrapBox>
      <Row icss:justify='space-between'>
        {/* TODO: not correct for this */}
        <AppLogo />
        <Row icss:align='end'>
          <SettingButtonTrigger />
          <WalletWidget />
        </Row>
      </Row>
    </NaBar_NavWrapBox>
  )
}

/**
 * triggers
 */
function SettingButtonTrigger() {
  return (
    <Fragnment>
      <Box
        icss={[{ padding: '8px', borderRadius: '8px' }, icssClickable]}
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
  const { value, setValue, isValid, isEmpty } = createFormField({
    name: 'rpcUrl',
    value: store.rpc?.url,
    validRule: (value) => parseUrl(value).isValid,
  })
  const inputController = useInputController('Input__rpcUrl')
  createEffect(() => {
    console.log('isFocused: ', inputController.isFocused?.())
  })
  return (
    <Box>
      <Section>
        <ItemBox>
          <Text>RPC:</Text>
          <Input
            id='Input__rpcUrl'
            value={value}
            onInput={(text) => {
              setValue(text)
            }}
            icss={{ borderStyle: 'solid', borderColor: isEmpty() ? 'gray' : isValid() ? 'green' : 'crimson' }}
          />
        </ItemBox>
      </Section>
    </Box>
  )
}

export type FormField<T> = {
  value: Accessor<T>
  setValue: (to: T) => void
  isEmpty: Accessor<boolean>
  isValid: Accessor<boolean>
}

export type UseFormFieldOpts<T> = {
  name: string
  value?: Accessify<T>
  onChange?(value: T): void

  // if not specified, value will always be considered as valid
  validRule?(value: any): boolean
}
