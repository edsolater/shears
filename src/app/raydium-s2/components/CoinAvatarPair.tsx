import { KitProps, useKitProps } from '../../../packages/piv'
import { Box } from '../../../packages/pivkit'
import { Token } from '../stores/tokenList/type'
import { CoinAvatar, CoinAvatarProps } from './CoinAvatar'

export type CoinAvatarPairProps = KitProps<{
  token1?: Token
  token2?: Token
  size?: CoinAvatarProps['size']

  token1Props?: CoinAvatarProps
  token2Props?: CoinAvatarProps
}>

export function CoinAvatarPair(rawProps: CoinAvatarPairProps) {
  const props = useKitProps(rawProps)
  return (
    <Box shadowProps={props} icss={{ display: 'flex' }}>
      <CoinAvatar token={props.token1} size={props.size} shadowProps={props.token1Props} icss={{ zIndex: 1 }} />
      <CoinAvatar token={props.token2} size={props.size} shadowProps={props.token2Props} icss={{ marginLeft: '-18%' }} />
    </Box>
  )
}