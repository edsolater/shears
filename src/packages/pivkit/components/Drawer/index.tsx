import { hasProperty } from '@edsolater/fnkit'
import { createEffect, createSignal, Show } from 'solid-js'
import { KitProps, Piv, useKitProps, ValidController, ValidProps } from '../../../piv'
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
    controllerRef: DrawerController
  }
>

const DrawerDefaultProps = { placement: 'from-right' } satisfies DrawerProps

export function Drawer(rawProps: DrawerProps) {
  const controller: DrawerController = () => ({
    get isOpen() {
      return Boolean(isOpen())
    },
    placement: props.placement,
    open,
    close
  })

  const props = useKitProps<DrawerProps, DrawerController, typeof DrawerDefaultProps>(rawProps, {
    defaultProps: DrawerDefaultProps,
    plugin: [drawerKeyboardShortcutPlugin],
    initController: controller
  })

  
  // TODO: loadPropsContollerRef hook
  
  const [isOpen, setIsOpen] = createSignal(props.open)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  
  loadPropsContollerRef(props, controller)
  
  return (
    <PopPortal>
      <Show when={isOpen()}>
        <Piv shadowProps={props} icss={{ width: 400, height: '100dvh', background: 'dodgerblue' }}></Piv>
      </Show>
    </PopPortal>
  )
}

function loadPropsContollerRef<ControllerType extends ValidController>(
  props: Partial<KitProps<{ controllerRef?: (controller: ControllerType) => void }>>,
  providedController: ControllerType
) {
  console.log('props: ', props.controllerRef, providedController)
  console.log('1: ', 1)
  if (hasProperty(props, 'controllerRef')) {
    props.controllerRef!(providedController)
  }
}
