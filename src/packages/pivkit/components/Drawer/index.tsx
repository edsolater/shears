import { createEffect, createSignal, Show } from 'solid-js'
import { KitProps, Piv, useKitProps } from '../../../piv'
import { drawerKeyboardShortcutPlugin } from './plugins/drawerKeyboardShortcutPlugin'
import { PopPortal } from './PopPortal'

export type DrawerController = () => {
  isOpen: boolean
  placement: NonNullable<DrawerProps['placement']>
  open(): void
  close(): void
}

export type DrawerProps = KitProps<
  {
    open?: boolean
    placement?: 'from-left' | 'from-bottom' | 'from-top' | 'from-right'
  },
  {
    controller: DrawerController
  }
>

export function Drawer(rawProps: DrawerProps) {
  const controller = () => ({
    get isOpen() {
      return isOpen()
    },
    placement: props.placement,
    open,
    close
  })

  const props = useKitProps(rawProps, {
    defaultProps: { placement: 'from-right' },
    plugin: [drawerKeyboardShortcutPlugin],
    initController: controller
  })

  // TODO: loadPropsContollerRef hook

  const [isOpen, setIsOpen] = createSignal(props.open)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  return (
    <PopPortal>
      <Show when={isOpen()}>
        <Piv shadowProps={props} icss={{ width: 400, height: '100dvh', background: 'dodgerblue' }}></Piv>
      </Show>
    </PopPortal>
  )
}
