import { type KitProps, Row, useKitProps } from '../../packages/pivkit'
import type { Token } from '../utils/dataStructures/Token'
import { TokenAvatar, type TokenAvatarProps } from './TokenAvatar'
import { TokenSymbol, type TokenSymbolProps } from './TokenSymbol'

type TokenProps = {
  token?: Token
  propofTokenAvatar?: TokenAvatarProps
  propofTokenSymbol?: TokenSymbolProps
}

export function Token(kitProps: KitProps<TokenProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'Token' })
  return (
    <Row shadowProps={shadowProps}>
      <TokenAvatar token={props.token} {...props.propofTokenAvatar} />
      <TokenSymbol token={props.token} {...props.propofTokenSymbol} />
    </Row>
  )
}
