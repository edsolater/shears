import { createEffect, createSignal, Show } from 'solid-js'
import { addDefaultProps, KitProps, Piv, useKitProps } from '../../../piv'
import { createRef } from '../../hooks/createRef'
import { modalKeyboardShortcut } from './plugins/modalKeyboardShortcut'
import { PopPortal } from './PopPortal'

export type ModalController = {
  isOpen: boolean
  placement: NonNullable<ModalProps['placement']>
  open(): void
  close(): void
  toggle(): void
}

export type ModalProps = {
  open?: boolean
  placement?: 'from-left' | 'from-bottom' | 'from-top' | 'from-right'
}
const modalDefaultProps = { placement: 'from-right' } satisfies ModalProps

export type ModalDefaultProps = typeof modalDefaultProps

export function Modal(kitProps: KitProps<ModalProps, { controller: ModalController }>) {
  const rawProps = useKitProps<ModalProps, ModalController>(kitProps, {
    plugin: [modalKeyboardShortcut()],
    controller: (mergedProps) => ({
      get isOpen() {
        return Boolean(isOpen())
      },
      placement: mergedProps.placement ?? modalDefaultProps.placement,
      open() {
        open()
        modalRef()?.focus()
      },
      close,
      toggle() {
        if (isOpen()) {
          close()
        } else {
          open()
          modalRef()?.focus()
        }
      }
    })
  })
  const props = addDefaultProps(rawProps, modalDefaultProps)
  const [modalRef, setModalRef] = createRef<HTMLDivElement>()
  const [isOpen, setIsOpen] = createSignal(props.open)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  return (
    <Show when={isOpen()}>
      <Piv
        ref={setModalRef}
        shadowProps={props}
        icss={{
          width: isOpen() ? 300 : 400,
          color: 'blue',
          height: '30dvh',
          background: 'dodgerblue',
          overflow: 'hidden'
        }}
      >
        <dialog open>
          <div style={{ width: '500px', height: '500px', border: 'solid' }}>modal</div>
        </dialog>
      </Piv>
    </Show>
  )
}
