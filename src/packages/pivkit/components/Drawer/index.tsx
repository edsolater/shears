import { KitProps, Piv, useKitProps } from '../../../piv'
import { PopPortal } from './PopPortal'

export type DrawerProps = KitProps<{
  open?: boolean
  placement?: 'from-left' | 'from-bottom' | 'from-top' | 'from-right'
}>

export function Drawer(rawProps: DrawerProps) {
  const props = useKitProps(rawProps, { defaultProps: { placement: 'from-right' } })
  return (
    <PopPortal>
      <Piv icss={{ width: 400, height: '100dvh', background: 'dodgerblue' }}></Piv>
    </PopPortal>
  )
}
