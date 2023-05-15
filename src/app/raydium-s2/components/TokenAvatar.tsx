import { KitProps, Piv, addDefaultProps, useKitProps } from '../../../packages/piv'
import { Image, ImageProps } from '../../../packages/pivkit'
import { Token } from '../utils/dataStructures/Token'

export type TokenAvatarProps = {
  token?: Token
  /** xs: 16px | sm: 20px | smi: 24px | md: 32px | lg: 48px | 2xl: 80px | (default: md) */
  size?: 'xs' | 'sm' | 'smi' | 'md' | 'lg' | '2xl'
} & ImageProps

export function TokenAvatar(kitProps: KitProps<TokenAvatarProps>) {
  const { props: rawProps } = useKitProps(kitProps)
  const props = addDefaultProps(rawProps, { size: 'md' })

  return <Piv icss={{ marginInline: 4 }}>{props.token?.symbol ?? props.token?.name}</Piv>
  return (
    <Image
      shadowProps={props}
      src={props.token?.icon}
      alt={props.token?.name ?? props.token?.symbol}
      icss={{
        '--size':
          props.size === '2xl'
            ? '80px'
            : props.size === 'lg'
            ? '48px'
            : props.size === 'md'
            ? '24px'
            : props.size === 'sm'
            ? '18px'
            : '12px',
        width: 'var(--size)',
        height: 'var(--size)',
        borderRadius: '50%'
      }}
    />
  )
}
