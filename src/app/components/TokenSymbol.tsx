import { KitProps, useKitProps, Text } from '../../packages/pivkit'
import type { Token } from '../utils/dataStructures/Token'

export type TokenSymbolProps = {
  token?: Token
}
export function TokenSymbol(kitProps: KitProps<TokenSymbolProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'TokenSymbol' })
  return <Text shadowProps={shadowProps}>{props.token?.symbol}</Text>
}
