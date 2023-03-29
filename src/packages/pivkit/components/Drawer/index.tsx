import { hasProperty } from '@edsolater/fnkit'
import { createEffect, createSignal, Show } from 'solid-js'
import { KitProps, Piv, useKitProps, ValidController, ValidProps } from '../../../piv'
import { drawerKeyboardShortcutPlugin } from './plugins/drawerKeyboardShortcutPlugin'
import { PopPortal } from './PopPortal'

export type DrawerController = {
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

const DrawerDefaultProps = { placement: 'from-right' } satisfies DrawerProps

export function Drawer(rawProps: DrawerProps) {
  const props = useKitProps(rawProps, {
    defaultProps: DrawerDefaultProps,
    plugin: [drawerKeyboardShortcutPlugin],
    initController: (mergedProps) => ({
      get isOpen() {
        return Boolean(isOpen())
      },
      placement: mergedProps.placement,
      open,
      close
    })
  })

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
