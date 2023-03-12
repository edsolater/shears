import { KitProps, useKitProps } from '../../../packages/piv'
import { Image, ImageProps } from '../../../packages/pivkit'
import { getToken } from "../stores/tokenList/getToken"
import { Token } from '../stores/tokenList/type'

type CoinAvatarProps = KitProps<
  {
    tokenMint?: string
    token?: Token
  },
  { extendsProp: ImageProps }
>

export function CoinAvatar(rawProps: CoinAvatarProps) {
  const props = useKitProps(rawProps)
  const coin = () => (props.tokenMint ? getToken(props.tokenMint) : props.token)
  return <Image shadowProps={props} src={coin()?.icon} alt={coin()?.name} icss={{ width: 24, height: 24 }} />
}
