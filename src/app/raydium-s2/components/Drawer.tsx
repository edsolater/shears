import { Portal } from 'solid-js/web'
import { KitProps, Piv, useKitProps } from '../../../packages/piv'

export type DrawerProps = KitProps<{
  open?: boolean
  placement?: 'from-left' | 'from-bottom' | 'from-top' | 'from-right'
}>

export function Drawer(rawProps: DrawerProps) {
  const props = useKitProps(rawProps, { defaultProps: { placement: 'from-right' } })
  const element = createPopStackHTMLElement()
  return (
    <Portal mount={element}>
      <Piv icss={{ width: 400, height: '100dvh', background: 'dodgerblue' }}></Piv>
    </Portal>
  )
}

function createPopStackHTMLElement() {
  if ('document' in globalThis) {
    const div = document.createElement('div')
    div.id = 'pop-stack'
    document.body.appendChild(div)
    div.style.position = 'fixed'
    div.style.inset = '0'

    // document.head.appendChild(`<style>

    // </style>`)
    return div
  }
}
