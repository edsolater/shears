import { Box, KitProps, useKitProps } from '@edsolater/pivkit'
import { Token } from '../utils/dataStructures/Token'
import { TokenAvatar, type TokenAvatarRawProps } from './TokenAvatar'
import type { TokenQueryParam } from '../stores/data/shapeParser/token'

export interface TokenAvatarPairProps {
  token1?: TokenQueryParam
  token2?: TokenQueryParam
  size?: TokenAvatarRawProps['size']

  token1Props?: TokenAvatarRawProps
  token2Props?: TokenAvatarRawProps
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
