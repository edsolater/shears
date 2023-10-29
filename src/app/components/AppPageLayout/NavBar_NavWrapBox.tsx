import { KitProps, Piv, renderHTMLDOM, useKitProps } from '../../../packages/pivkit'
import { useMetaTitle } from '../../hooks/useMetaTitle'

export interface NaBar_NavWrapBoxProps {
  title?: string
}

export function NaBar_NavWrapBox(kitProps: KitProps<NaBar_NavWrapBoxProps>) {
  const { shadowProps, props } = useKitProps(kitProps)
  useMetaTitle(() => props.title)
  return (
    <Piv<'nav'>
      shadowProps={shadowProps}
      icss={{ userSelect: 'none', padding: '16px 48px', transition: '150ms' }}
      render:self={(selfProps) => renderHTMLDOM('nav', selfProps)}
    />
  )
}
