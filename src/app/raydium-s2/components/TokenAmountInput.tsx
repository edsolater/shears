import { isStringNumber } from '@edsolater/fnkit'
import { createMemo } from 'solid-js'
import { KitProps, Piv, useKitProps } from '../../../packages/piv'
import { Box, BoxProps, List, Text, b_clickable, b_row, createRef } from '../../../packages/pivkit'
import { Card } from '../../../packages/pivkit/components/Card'
import { Input } from '../../../packages/pivkit/components/Input'
import { ListBox } from '../../../packages/pivkit/components/ListBox'
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
  onSelectToken?: (token: Token | undefined) => void
  amount?: Numberish
  onAmountChange?: (amount: Numberish | undefined) => void
}

export function TokenAmountInputBox(rawProps: KitProps<TokenAmountInputBoxProps>) {
  const { props, loadController } = useKitProps(rawProps)

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
    <Box icss={b_row({ gap: 8 })}>
      {/* show current token info */}
      <Piv onClick={() => modalRef()?.open()} icss={{ width: '5em', border: 'solid', height: '1.5em' }}>
        {token()?.symbol}
      </Piv>

      {/* token amount info */}
      <Input
        icss={{ border: 'solid', width: '12em', flex: 0 }}
        value={amount}
        onUserInput={({ text }) => {
          isStringNumber(text) ? setAmount(text) : undefined
        }}
      />

      {/* modal dialog */}
      <Modal controllerRef={setModalRef} isModal>
        <TokenSelectorModalContent
          onTokenSelect={(token) => {
            console.log('token: ', token)
            setToken(token)
          }}
        />
      </Modal>
    </Box>
  )
}

/**
 * hold state (store's tokens)
 */
function TokenSelectorModalContent(rawProps: KitProps<{ onTokenSelect?(token: Token | undefined): void } & BoxProps>) {
  const { props } = useKitProps(rawProps)
  const dataStore = useDataStore()
  const tokens = createMemo(() => dataStore.allTokens)
  return (
    <Card>
      <Box>
        search: <Input />
      </Box>

      <Text icss={{ fontSize: '14px', fontWeight: 'bold' }}>Token</Text>

      <ListBox>
        <List items={tokens}>
          {(token) => <TokenSelectorModalContent_TokenItem token={token} onTokenChange={props.onTokenSelect} />}
        </List>
      </ListBox>
    </Card>
  )
}

function TokenSelectorModalContent_TokenItem(
  rawProps: KitProps<{ token: Token; onTokenChange?(token: Token): void } & BoxProps>
) {
  const { props } = useKitProps(rawProps)
  return (
    <Box
      icss={[b_row(), b_clickable()]}
      shadowProps={props}
      onClick={() => {
        console.log('props.token: ', props.token)
        props.onTokenChange?.(props.token)
      }}
    >
      <TokenAvatar token={props.token} />
    </Box>
  )
}
