import { createEffect, createSignal, onCleanup, untrack } from 'solid-js'
import { KitProps, Piv, useKitProps } from '../../../piv'
import { createRef } from '../../hooks/createRef'
import { onEvent } from '../../../domkit'
import { calcHypotenuse } from '@edsolater/fnkit'
import { useDOMEventListener } from '../../hooks/useDOMEventListener'
import { useClickOutside } from '../../hooks/useClickOutside'

export type ModalController = {
  isOpen: boolean
  open(): void
  close(): void
  toggle(): void
}

export type ModalProps = {
  open?: boolean
  isModal?: boolean
  onClose?(): void
}

export function Modal(rawProps: KitProps<ModalProps>) {
  const controllerCreator = () =>
    ({
      get isOpen() {
        return innerOpen()
      },
      open: openDialog,
      close: closeDialog,
      toggle: toggleDialog
    } satisfies ModalController)
  const props = useKitProps<ModalProps>(rawProps, { controller: controllerCreator })

  const [dialogRef, setDialogRef] = createRef<HTMLDialogElement>()

  const [innerOpen, setInnerOpen] = createSignal(props.open ?? false)

  // initly load modal show
  createEffect(() => {
    if (props.open) {
      openDialog()
    }
  })

  // register onClose callback
  useDOMEventListener(dialogRef, 'close', () => closeDialog({ witDOMChange: false }))

  useClickOutside(dialogRef, {
    disable: () => !innerOpen(),
    onClickOutSide: ({ ev }) => {
      if (dialogRef() && ev.target !== dialogRef()) {
        // TODO
        closeDialog()
      }
    }
  })

  const openDialog = () => {
    setInnerOpen(true)
    props.isModal ? dialogRef()?.showModal() : dialogRef()?.show()
  }

  const closeDialog = (options?: { /** if it's caused by dom, it should set false */ witDOMChange?: boolean }) => {
    setInnerOpen(false)
    if (options?.witDOMChange ?? true) dialogRef()?.close()
    props.onClose?.()
  }

  const toggleDialog = () => {
    innerOpen() ? closeDialog() : openDialog()
  }

  console.log('props.children: ', props.children)
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
