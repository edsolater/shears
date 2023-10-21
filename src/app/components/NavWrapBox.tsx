import { createEffect } from 'solid-js'
import { KitProps, Piv, renderHTMLDOM, useKitProps } from '../../packages/pivkit'

export interface NavWrapBoxProps {
  title?: string
}

export function NavWrapBox(kitProps: KitProps<NavWrapBoxProps>) {
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

function useMetaTitle(title?: () => string | undefined) {
  createEffect(() => {
    if (globalThis.document && title?.()) Reflect.set(globalThis.document, 'title', `${title()} - shears`)
  })
}
