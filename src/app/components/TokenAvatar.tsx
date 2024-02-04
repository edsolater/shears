import {
  Image,
  ImageProps,
  KitProps,
  useKitProps,
  addDefaultProps,
  Piv,
  Box,
  Accessify,
  deAccessify,
} from '@edsolater/pivkit'
import type { Token } from '../utils/dataStructures/Token'

export interface TokenAvatarRawProps {
  token?: Token
  /** xs: 12px | sm: 20px | smi: 24px | md: 32px | lg: 48px | 2xl: 80px | (default: md) */
  size?: 'xs' | 'sm' | 'smi' | 'md' | 'lg' | '2xl'
}

type TokenAvatarProps = KitProps<TokenAvatarRawProps>

export function TokenAvatar(kitProps: TokenAvatarProps) {
  const { props, shadowProps } = useKitProps(kitProps, { defaultProps: { size: 'md' } })

  const size =
    props.size === '2xl'
      ? '80px'
      : props.size === 'lg'
        ? '48px'
        : props.size === 'md'
          ? '24px'
          : props.size === 'sm'
            ? '18px'
            : '12px'
  return (
    <Box
      icss={{
        borderRadius: '50%',
        padding: '4px',
        background: 'linear-gradient(126.6deg, rgba(171, 196, 255, 0.2) 28.69%, rgba(171, 196, 255, 0) 100%)',
        border: 'solid #616A9D',

        '--size': size,
        width: 'var(--size)',
        height: 'var(--size)',
      }}
    >
      <Image
        shadowProps={shadowProps}
        src={props.token?.icon}
        alt={props.token?.name ?? props.token?.symbol}
        icss={{
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      />
    </Box>
  )
}


