import { isStringNumber } from '@edsolater/fnkit'
import {
  Accessify,
  Box,
  BoxProps,
  Input,
  InputKitProps,
  KitProps,
  List,
  Panel,
  Text,
  TextProps,
  createIncresingAccessor,
  createRef,
  createSyncSignal,
  icssClickable,
  icssCyberpenkBackground,
  icssFrostedCard,
  icssInputType,
  icssLabel,
  icssRow,
  plugin_modalTitle,
  useKitProps,
  Modal,
  ModalController,
} from '@edsolater/pivkit'
import { store } from '../stores/data/store'
import { Token } from '../utils/dataStructures/Token'
import { toString } from '../utils/dataStructures/basicMath/format'
import { Numberish } from '@edsolater/fnkit'
import { slice } from '../utils/dataTransmit/itemMethods'
import { TokenAvatar } from './TokenAvatar'

export interface TokenAmountInputBoxController {}

export type TokenAmountInputBoxProps = KitProps<
  {
    token?: Token
    tokenProps?: TextProps
    amount?: Numberish
    'anatomy:amountInput'?: InputKitProps
    'anatomy:tokenSelectorModalContent'?: TokenSelectorModalContentProps
    onSelectToken?: (token: Token | undefined) => void
    onAmountChange?: (amount: Numberish | undefined) => void
  },
  { controller: TokenAmountInputBoxController }
>

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
      <Modal title='select token' controllerRef={setModalRef as any}>
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

interface TokenSelectorModalContentRawProps {
  onTokenSelect?(token: Token | undefined): void
}
type TokenSelectorModalContentProps = KitProps<TokenSelectorModalContentRawProps>

/**
 * hold state (store's tokens)
 */
function TokenSelectorModalContent(rawProps: TokenSelectorModalContentProps) {
  const { props, shadowProps } = useKitProps(rawProps)
  const tokens = store.tokens
  const increasing = createIncresingAccessor()
  return (
    <Panel shadowProps={shadowProps}>
      <Text plugin={plugin_modalTitle}>{`Select a token ${increasing()}`}</Text>

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
