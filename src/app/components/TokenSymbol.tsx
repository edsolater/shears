import { type KitProps, Text, useKitProps } from '@edsolater/pivkit'
import { type UseTokenParam, useToken } from '../stores/data/shapeParser/token'
import { Token } from '../utils/dataStructures/Token'

export interface TokenSymbolBaseOption {
  /** @default true */
  wsolToSol?: boolean
}
export interface TokenSymbolProps extends TokenSymbolBaseOption {
  token?: UseTokenParam
}
export function TokenSymbol(kitProps: KitProps<TokenSymbolProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'TokenSymbol' })
  const token = useToken(props.token)
  return <Text shadowProps={shadowProps}>{wsolToSol(token.symbol)}</Text>
}

function wsolToSol(s: Token['symbol']) {
  if (s === 'WSOL') return 'SOL'
  return s
}
