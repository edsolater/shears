import { createSignal, Show } from 'solid-js'
import { addDefaultProps, KitProps, Piv, useKitProps } from '../../../piv'
import { createRef } from '../../hooks/createRef'
import { drawerKeyboardShortcut } from './plugins/drawerKeyboardShortcut'
import { PopPortal } from './PopPortal'

export type DrawerController = {
  isOpen: boolean
  placement: NonNullable<DrawerProps['placement']>
  open(): void
  close(): void
  toggle(): void
}

export type DrawerProps = {
  open?: boolean
  placement?: 'from-left' | 'from-bottom' | 'from-top' | 'from-right'
}
const drawerDefaultProps = { placement: 'from-right' } satisfies DrawerProps

export type DrawerDefaultProps = typeof drawerDefaultProps

export function Drawer(kitProps: KitProps<DrawerProps, { controller: DrawerController }>) {
  const { props: rawProps } = useKitProps(kitProps, {
    plugin: [drawerKeyboardShortcut()],
    controller: (mergedProps) => ({
      get isOpen() {
        return Boolean(isOpen())
      },
      placement: mergedProps.placement ?? drawerDefaultProps.placement,
      open() {
        open()
        drawerRef()?.focus()
      },
      close,
      toggle() {
        if (isOpen()) {
          close()
        } else {
          open()
          drawerRef()?.focus()
        }
      }
    })
  })
  const props = addDefaultProps(rawProps, drawerDefaultProps)
  const [drawerRef, setDrawerRef] = createRef<HTMLDivElement>()
  const [isOpen, setIsOpen] = createSignal(props.open)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  return (
    <PopPortal id='pop-stack'>
      <Show when={isOpen()}>
        <Piv
          ref={setDrawerRef}
          shadowProps={props}
          icss={{ width: isOpen() ? 300 : 400, height: '100dvh', background: 'dodgerblue' }}
        ></Piv>
      </Show>
    </PopPortal>
  )
}
