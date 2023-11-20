import { createSignal, Show } from 'solid-js'
import { addDefaultProps, KitProps, Piv, useKitProps } from '../../piv'
import { createRef } from '../../hooks/createRef'
import { drawerKeyboardShortcut } from '../plugins/drawerKeyboardShortcut'
import { PopPortal } from '../PopPortal'

export interface DrawerController {
  isOpen: boolean
  placement: NonNullable<DrawerKitProps['placement']>
  open(): void
  close(): void
  toggle(): void
}
export type DrawerProps = {
  open?: boolean
  placement?: 'from-left' | 'from-bottom' | 'from-top' | 'from-right'
}
export type DrawerKitProps = KitProps<DrawerProps, { controller: DrawerController }>
const drawerDefaultProps = { placement: 'from-right' } satisfies DrawerKitProps
export type DrawerDefaultProps = typeof drawerDefaultProps

export function Drawer(kitProps: DrawerKitProps) {
  const { props: rawProps } = useKitProps(kitProps, {
    name: 'Drawer',
    plugin: drawerKeyboardShortcut,
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
      },
    }),
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
          domRef={setDrawerRef}
          shadowProps={props}
          icss={{
            width: isOpen() ? '300px' : '400px',
            height: '100dvh',
            background: 'dodgerblue',
            '@starting-style &': { transform:'scale(0)' },
            transform:'scale(1)',
            transition: '500ms',
          }}
        />
      </Show>
    </PopPortal>
  )
}
