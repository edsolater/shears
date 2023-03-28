import { Portal } from 'solid-js/web'
import { KitProps, Piv, useKitProps } from '../../../packages/piv'

export type DrawerProps = KitProps<{
  open?: boolean
  placement?: 'from-left' | 'from-bottom' | 'from-top' | 'from-right'
}>

export function Drawer(rawProps: DrawerProps) {
  const props = useKitProps(rawProps, { defaultProps: { placement: 'from-right' } })

  return (
    <Portal mount={document.getElementById('pop-stack') ?? undefined}>
      <Piv icss={{ width: 400, height: '100dvh', background: 'dodgerblue' }}></Piv>
    </Portal>
  )
}
