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
  /* ---------------------------------- props --------------------------------- */
  return (
    <Piv<'img'>
      render:self={(selfProps) => renderHTMLDOM('img', selfProps)}
      htmlProps={{ alt: props.name, src: props.src }}
      icss={{ display: 'block' }}
      shadowProps={props}
      class={Icon.name}
    />
  )
}
