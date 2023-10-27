import { Accessor, createEffect } from 'solid-js'
import {
  Accessify,
  Box,
  Fragnment,
  Input,
  InputController,
  ItemBox,
  Modal,
  ModalController,
  Section,
  Text,
  createControllerRef,
  icssClickable,
  icssRow,
} from '../../../packages/pivkit'
import { createFormField } from '../../../packages/pivkit/hooks/createFormField'
import { threeGridSlotBoxICSS } from '../../icssBlocks/threeGridSlotBoxICSS'
import { store } from '../../stores/data/store'
import { parseUrl } from '../../utils/parseUrl'
import { AppLogo } from '../AppLogo'
import { AppPageLayout_NavWrapBox, AppPageLayout_NavWrapBoxProps } from './NavWrapBox'
import { RoutesButtons } from '../RoutesButtons'
import { WalletWidget } from '../WalletWidget'
import { useInputController } from '../../../packages/pivkit/components/Input/hooks/useInputController'

export type AppPageLayout_NavBarProps = AppPageLayout_NavWrapBoxProps

export function AppPageLayout_NavBar(props: AppPageLayout_NavBarProps) {
  return (
    <AppPageLayout_NavWrapBox title={props.title}>
      <Box icss={threeGridSlotBoxICSS}>
        <AppLogo title={props.title}></AppLogo>

        {/* tabs */}
        <RoutesButtons />

        <ItemBox icss={icssRow}>
          <SettingButtonTrigger />
          <WalletWidget />
        </ItemBox>
      </Box>
    </AppPageLayout_NavWrapBox>
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
    value: store.rpcUrl,
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
            onInput={({ text }) => {
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