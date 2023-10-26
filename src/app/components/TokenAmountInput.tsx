import { isStringNumber, mergeFunction } from '@edsolater/fnkit'
import {
  Accessify,
  Box,
  BoxKitProps,
  BoxProps,
  Card,
  Input,
  InputProps,
  KitProps,
  List,
  Modal,
  ModalController,
  Piv,
  Text,
  TextProps,
  createRef,
  createSyncSignal,
  icssClickable,
  icssInputType,
  icssLabel,
  icssRow,
  useKitProps,
} from '../../packages/pivkit'
import { store } from '../stores/data/store'
import { Token } from '../utils/dataStructures/Token'
import { toString } from '../utils/dataStructures/basicMath/format'
import { Numberish } from '../utils/dataStructures/type'
import { TokenAvatar } from './TokenAvatar'

export interface TokenAmountInputBoxController {}

export interface TokenAmountInputBoxProps {
  token?: Accessify<Token | undefined, TokenAmountInputBoxController>
  tokenProps?: TextProps
  amount?: Accessify<Numberish | undefined, TokenAmountInputBoxController>
  'anatomy:amountInput'?: InputProps
  'anatomy:tokenSelectorModalContent'?: TokenSelectorModalContentProps
  onSelectToken?: (token: Token | undefined) => void
  onAmountChange?: (amount: Numberish | undefined) => void
}

export function TokenAmountInputBox(rawProps: TokenAmountInputBoxProps) {
  const { props, lazyLoadController } = useKitProps(rawProps)

  const [token, setToken] = createSyncSignal({
    getValueFromOutside: () => props.token,
    onInvokeSetter: (token) => {
      props.onSelectToken?.(token)
    },
  })
  const [amount, setAmount] = createSyncSignal({
    getValueFromOutside: () => (props.amount != null ? toString(props.amount) : undefined),
    onInvokeSetter: (amount) => {
      props.onAmountChange?.(amount)
    },
  })

  const [modalRef, setModalRef] = createRef<ModalController>()

  return (
    <Box icss={icssRow({ gap: '8px' })}>
      {/* show current token info */}
      <Box shadowProps={props.tokenProps} onClick={() => modalRef()?.open()} icss={[icssLabel, icssClickable]}>
        {token()?.symbol}
      </Box>
      {/* <Piv
        debugLog={['children']}
        shadowProps={{
          children: token()?.symbol,
          icss: { color: token()?.symbol === 'SOL' ? 'dodgerblue' : 'crimson' },
        }}
      ></Piv> */}

      {/* token amount info */}
      <Input
        shadowProps={props['anatomy:amountInput']}
        icss={icssInputType()}
        value={amount}
        onUserInput={({ text }) => {
          isStringNumber(text) ? setAmount(text) : undefined
        }}
      />

      {/* modal dialog */}
      <Modal controllerRef={setModalRef}>
        <TokenSelectorModalContent
          shadowProps={props['anatomy:tokenSelectorModalContent']}
          onTokenSelect={mergeFunction(setToken, () => {
            modalRef()?.close()
          })}
        />
      </Modal>
    </Box>
  )
}

interface TokenSelectorModalContentProps extends BoxKitProps {
  onTokenSelect?(token: Token | undefined): void
}

/**
 * hold state (store's tokens)
 */
function TokenSelectorModalContent(rawProps: TokenSelectorModalContentProps) {
  const { props } = useKitProps(rawProps)
  const tokens = store.tokens
  return (
    <Card>
      <Box>
        search: <Input icss={{ border: 'solid' }} />
      </Box>

      <Text icss={{ fontSize: '14px', fontWeight: 'bold' }}>Token</Text>

      <List items={tokens}>
        {(token) => <TokenSelectorModalContent_TokenItem token={token} onSelect={props.onTokenSelect} />}
      </List>
    </Card>
  )
}

function TokenSelectorModalContent_TokenItem(
  rawProps: KitProps<{ token: Token; onSelect?(token: Token): void /* 🚧 meanly use `onClick` */ } & BoxProps>,
) {
  const { props } = useKitProps(rawProps)
  return (
    <Box
      icss={[icssRow(), icssClickable()]}
      shadowProps={props}
      onClick={() => {
        props.onSelect?.(props.token)
      }}
    >
      <TokenAvatar token={props.token} />
    </Box>
  )
}
