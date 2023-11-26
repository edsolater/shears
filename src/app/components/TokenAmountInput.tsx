import { isStringNumber } from '@edsolater/fnkit'
import {
  Accessify,
  Box,
  BoxProps,
  Input,
  InputKitProps,
  KitProps,
  List,
  Modal,
  ModalController,
  Panel,
  Text,
  TextKitProps,
  createRef,
  createSyncSignal,
  icssClickable,
  icssCyberpenkBackground,
  icssFrostedCard,
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
import { slice } from '../utils/dataTransmit/itemMethods'

export interface TokenAmountInputBoxController {}

export interface TokenAmountInputBoxProps {
  token?: Accessify<Token | undefined, TokenAmountInputBoxController>
  tokenProps?: TextKitProps
  amount?: Accessify<Numberish | undefined, TokenAmountInputBoxController>
  'anatomy:amountInput'?: InputKitProps
  'anatomy:tokenSelectorModalContent'?: TokenSelectorModalContentKitProps
  onSelectToken?: (token: Token | undefined) => void
  onAmountChange?: (amount: Numberish | undefined) => void
}

export function TokenAmountInputBox(rawProps: TokenAmountInputBoxProps) {
  const { props, lazyLoadController } = useKitProps(rawProps, {
    defaultProps: {
      'anatomy:tokenSelectorModalContent': {
        icss: [icssCyberpenkBackground, icssFrostedCard],
      },
    },
    name: 'TokenAmountInputBox',
  })

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
        onUserInput={(text) => {
          isStringNumber(text) ? setAmount(text) : undefined
        }}
      />

      {/* modal dialog */}
      <Modal title='select token' controllerRef={setModalRef}>
        <TokenSelectorModalContent
          shadowProps={props['anatomy:tokenSelectorModalContent']}
          onTokenSelect={(token) => {
            setToken(token ?? props.token)
            modalRef()?.close()
          }}
        />
      </Modal>
    </Box>
  )
}

interface TokenSelectorModalContentProps {
  onTokenSelect?(token: Token | undefined): void
}
type TokenSelectorModalContentKitProps = KitProps<TokenSelectorModalContentProps>

/**
 * hold state (store's tokens)
 */
function TokenSelectorModalContent(rawProps: TokenSelectorModalContentKitProps) {
  const { props, shadowProps } = useKitProps(rawProps)
  const tokens = store.tokens
  return (
    <Panel shadowProps={shadowProps}>
      <Box>
        search: <Input icss={{ border: 'solid' }} />
      </Box>

      <Text icss={{ fontSize: '14px', fontWeight: 'bold' }}>Token</Text>

      <List items={slice(tokens, 10)}>
        {(token) => <TokenSelectorModalContent_TokenItem token={token} onSelect={props.onTokenSelect} />}
      </List>
    </Panel>
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
