import { createSignal, Show } from 'solid-js'
import { KitProps, Piv, useKitProps } from '../../../piv'
import { createRef } from '../../hooks/createRef'
import { drawerKeyboardShortcutPlugin } from './plugins/drawerKeyboardShortcutPlugin'
import { PopPortal } from './PopPortal'

export type DrawerController = {
  isOpen: boolean
  placement: NonNullable<DrawerProps['placement']>
  open(): void
  close(): void
  toggle(): void
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

const defaultProps = { placement: 'from-right' } satisfies DrawerProps

export type DrawerDefaultProps = typeof defaultProps

export function Drawer(rawProps: DrawerProps) {
  const props = useKitProps(rawProps, {
    defaultProps: defaultProps,
    plugin: [drawerKeyboardShortcutPlugin],
    controller: (mergedProps) => ({
      get isOpen() {
        return Boolean(isOpen())
      },
      placement: mergedProps.placement,
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

  const [drawerRef, setDrawerRef] = createRef<HTMLDivElement>()
  const [isOpen, setIsOpen] = createSignal(props.open)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  return (
    <PopPortal>
      <Show when={isOpen()}>
        <Piv
          ref={setDrawerRef}
          shadowProps={props}
          icss={{ width: 400, height: '100dvh', background: 'dodgerblue' }}
        ></Piv>
      </Show>
    </PopPortal>
  )
}
