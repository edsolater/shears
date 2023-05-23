import { KitProps, useKitProps } from '../../../packages/piv'
import { Box } from '../../../packages/pivkit'
import { Token } from '../utils/dataStructures/Token'
import { TokenAvatar, TokenAvatarProps } from './TokenAvatar'

export interface TokenAvatarPairProps {
  token1?: Token
  token2?: Token
  size?: TokenAvatarProps['size']

  token1Props?: TokenAvatarProps
  token2Props?: TokenAvatarProps
}

export function TokenAvatarPair(rawProps: KitProps<TokenAvatarPairProps>) {
  const { props } = useKitProps(rawProps)
  return (
    <Box shadowProps={props} icss={{ display: 'flex' }}>
      <TokenAvatar token={props.token1} size={props.size} shadowProps={props.token1Props} icss={{ zIndex: 1 }} />
      <TokenAvatar
        token={props.token2}
        size={props.size}
        shadowProps={props.token2Props}
        icss={{ marginLeft: '-18%' }}
      />
    </Box>
  )
}
