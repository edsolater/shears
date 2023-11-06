import { renderHTMLDOM } from '../piv/propHandlers/renderHTMLDOM'
import { KitProps, Piv, useKitProps } from '../piv'

export interface IconProps {
  name?: string
  /** sx: 12px; sm: 16px; smi: 20px; md: 24px; lg: 32px (default: md) */
  size?: 'xs' | 'sm' | 'smi' | 'md' | 'lg'
  src?: string
}

/**
 * if for layout , don't render important content in Box
 * @todo add fallbackSrc
 */
export function Icon(rawProps: KitProps<IconProps>) {
  const { props } = useKitProps(rawProps, { name: 'Icon' })
  const sizePx =
    props.size === 'xs' ? 12 : props.size === 'sm' ? 16 : props.size === 'smi' ? 20 : props.size === 'md' ? 24 : 32

    /** if not set src, no need to render wired broken image */
  const shouldRendSrc = () => Boolean(props.src)
  return (
    <Piv<'img'>
      render:self={(selfProps) => renderHTMLDOM('img', selfProps)}
      htmlProps={{ alt: props.name, src: props.src }}
      icss={{
        display: 'block',
        visibility: shouldRendSrc() ? undefined : 'hidden',
        width: `${sizePx}px`,
        height: `${sizePx}px`,
        objectFit: 'cover',
      }}
      shadowProps={props}
      class={Icon.name}
    />
  )
}
