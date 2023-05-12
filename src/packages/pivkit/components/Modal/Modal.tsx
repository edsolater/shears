import { createEffect, createSignal, Show } from 'solid-js'
import { addDefaultProps, KitProps, Piv, PivProps, useKitProps } from '../../../piv'
import { createRef } from '../../hooks/createRef'
import { Text } from '../Text'
import { modalKeyboardShortcut } from './plugins/modalKeyboardShortcut'

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
          width: 56,
          color: 'blue',
          height: 56,
          background: 'dodgerblue',
          overflow: 'hidden'
        }}
      >
        <OriginalHTMLDialogElement
          isModal
          open
          icss={{
            padding: 32,
            border: 'solid',
            '::backdrop': { background: 'rgba(0, 0, 0, 0.25)' }
          }}
        >
          <Text>modal</Text>
        </OriginalHTMLDialogElement>
      </Piv>
    </Show>
  )
}

type HTMLDialogProps = {
  open?: boolean
  isModal?: boolean
}

function OriginalHTMLDialogElement(rawProps: KitProps<HTMLDialogProps>) {
  const props = useKitProps<HTMLDialogProps>(rawProps)
  const [dialogRef, setDialogRef] = createRef<HTMLDialogElement>()

  createEffect(() => {
    if (props.open && dialogRef()) {
      props.isModal ? dialogRef()?.showModal() : dialogRef()?.show()
    }
  })

  return (
    <Piv
      as={(parsedPivProps) => <dialog {...parsedPivProps} open={props.open && !props.isModal} />}
      shadowProps={props}
      icss={{ outline: 'none' }}
      ref={setDialogRef}
    >
      {props.children}
    </Piv>
  )
}
