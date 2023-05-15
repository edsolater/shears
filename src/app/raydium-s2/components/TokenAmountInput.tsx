import { isStringNumber } from '@edsolater/fnkit'
import { KitProps, Piv, useKitProps } from '../../../packages/piv'
import { Box, icssBlock_row } from '../../../packages/pivkit'
import { Input } from '../../../packages/pivkit/components/Input'
import { createMutableSignal } from '../../../packages/pivkit/hooks/createMutableSignal'
import { Token } from '../utils/dataStructures/Token'
import { toString } from '../utils/dataStructures/basicMath/format'
import { Numberish } from '../utils/dataStructures/type'

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
    set: (amount) => props.onAmountChange?.(amount)
  })
  return (
    <Box icss={icssBlock_row({ gap: 8 })}>
      <Piv>{token()?.symbol}</Piv>
      <Input
        icss={{ border: 'solid', width: '12em', flex: 0 }}
        value={amount}
        onUserInput={({ text }) => {
          isStringNumber(text) ? setAmount(text) : undefined
        }}
      />
    </Box>
  )
}
