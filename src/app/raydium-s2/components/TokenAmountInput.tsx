import { isStringNumber } from '@edsolater/fnkit'
import { createEffect, createMemo } from 'solid-js'
import { KitProps, Piv, PivProps, useKitProps } from '../../../packages/piv'
import {
  Box,
  BoxProps,
  List,
  Text,
  TextProps,
  createRef,
  icss_clickable,
  icss_inputType,
  icss_label,
  icss_row
} from '../../../packages/pivkit'
import { Card } from '../../../packages/pivkit/components/Card'
import { Input, InputProps } from '../../../packages/pivkit/components/Input'
import { Modal, ModalController } from '../../../packages/pivkit/components/Modal'
import { createMutableSignal } from '../../../packages/pivkit/hooks/createMutableSignal'
import { useDataStore } from '../stores/data/store'
import { Token } from '../utils/dataStructures/Token'
import { toString } from '../utils/dataStructures/basicMath/format'
import { Numberish } from '../utils/dataStructures/type'
import { TokenAvatar } from './TokenAvatar'

export type TokenAmountInputBoxController = {}

export type TokenAmountInputBoxProps = {
  token?: Token
  tokenProps?: TextProps
  amount?: Numberish
  amountInputProps?: InputProps
  tokenSelectorModalContentProps?: TokenSelectorModalContentProps
  onSelectToken?: (token: Token | undefined) => void
  onAmountChange?: (amount: Numberish | undefined) => void
}

export function TokenAmountInputBox(rawProps: KitProps<TokenAmountInputBoxProps>) {
  const { props, lazyLoadController } = useKitProps(rawProps)

  const [token, setToken] = createMutableSignal({
    get: () => props.token,
    set: (token) => props.onSelectToken?.(token)
  })
  const [amount, setAmount] = createMutableSignal({
    get: () => (props.amount != null ? toString(props.amount) : undefined),
    set: (amount) => {
      props.onAmountChange?.(amount)
    }
  })

  const [modalRef, setModalRef] = createRef<ModalController>()

  return (
    <Box icss={icss_row({ gap: 8 })}>
      {/* show current token info */}
      <Text shadowProps={props.tokenProps} onClick={() => modalRef()?.open()} icss={[icss_label(), icss_clickable()]}>
        {token()?.symbol}
      </Text>

      {/* token amount info */}
      <Input
        shadowProps={props.amountInputProps}
        icss={icss_inputType()}
        value={amount}
        onUserInput={({ text }) => {
          isStringNumber(text) ? setAmount(text) : undefined
        }}
      />

      {/* modal dialog */}
      <Modal controllerRef={setModalRef} isModal>
        <TokenSelectorModalContent shadowProps={props.tokenSelectorModalContentProps} onTokenSelect={setToken} />
      </Modal>
    </Box>
  )
}

type TokenSelectorModalContentProps = {
  onTokenSelect?(token: Token | undefined): void
} & BoxProps

/**
 * hold state (store's tokens)
 */
function TokenSelectorModalContent(rawProps: KitProps<TokenSelectorModalContentProps>) {
  const { props } = useKitProps(rawProps)
  const dataStore = useDataStore()
  const tokens = createMemo(() => dataStore.allTokens)
  createEffect(() => {
    console.log('tokens(): ', tokens())
  })
  return (
    <Card>
      <Box>
        search: <Input />
      </Box>

      <Text icss={{ fontSize: '14px', fontWeight: 'bold' }}>Token</Text>

      <List items={tokens}>
        {(token) => <TokenSelectorModalContent_TokenItem token={token} onSelect={props.onTokenSelect} />}
      </List>
    </Card>
  )
}

function TokenSelectorModalContent_TokenItem(
  rawProps: KitProps<{ token: Token; onSelect?(token: Token): void /* 🚧 meanly use `onClick` */ } & BoxProps>
) {
  const { props } = useKitProps(rawProps)
  return (
    <Box
      icss={[icss_row(), icss_clickable()]}
      shadowProps={props}
      onClick={() => {
        props.onSelect?.(props.token)
      }}
    >
      <TokenAvatar token={props.token} />
    </Box>
  )
}
