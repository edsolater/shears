import { CSSInterpolation } from '@emotion/css'
import { Accessor, Show, createEffect, createSignal } from 'solid-js'
import { KitProps, Piv, useKitProps, } from '../../../piv'
import { createRef } from '../../hooks/createRef'
import { useClickOutside } from '../../hooks/useClickOutside'
import { useDOMEventListener } from '../../hooks/useDOMEventListener'

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

  /** style of backdrop */
  backdropICSS?: CSSInterpolation

  /**
   * control when to render DOM
   * @default 'first-open'
   */
  domRenderWhen?:
    | 'first-open' // not render DOM until open, but close will stay DOM [default]
    | 'open' // render DOM every open
    | 'always' // always stay DOM
}

export function Modal(rawProps: KitProps<ModalProps>) {
  const { props, lazyLoadController } = useKitProps(rawProps)
  lazyLoadController(() => ({
    get isOpen() {
      return innerOpen()
    },
    open: openDialog,
    close: closeDialog,
    toggle: toggleDialog
  }))
  const [dialogRef, setDialogRef] = createRef<HTMLDialogElement>()
  const [dialogContentRef, setDialogContentRef] = createRef<HTMLDivElement>()
  const [innerOpen, setInnerOpen] = createSignal(props.open ?? false)
  const { shouldRenderDOM } = useShouldRenderDOMDetector({ props, innerOpen })

  // initly load modal show
  createEffect(() => {
    if (props.open) {
      openDialog()
    }
  })

  // register onClose callback
  useDOMEventListener(dialogRef, 'close', () => closeDialog({ witDOMChange: false }))

  // register click outside
  useClickOutside(dialogContentRef, {
    disable: () => !innerOpen(),
    onClickOutSide: () => {
      closeDialog()
    }
  })

  // user action: open dialog
  const openDialog = () => {
    setInnerOpen(true)
    props.isModal ? dialogRef()?.showModal() : dialogRef()?.show()
  }

  // user action: close dialog
  const closeDialog = (options?: {
    /**
     *  if it's caused by dom, it should set false
     * @default true
     */
    witDOMChange?: boolean
  }) => {
    setInnerOpen(false)
    if (options?.witDOMChange ?? true) dialogRef()?.close()
    props.onClose?.()
  }

  // user action: toggle(open & close) dialog
  const toggleDialog = () => {
    innerOpen() ? closeDialog() : openDialog()
  }

  return (
    <Show when={shouldRenderDOM()}>
      <Piv
        as={(parsedPivProps) => <dialog {...parsedPivProps} open={props.open && !props.isModal} />}
        shadowProps={props}
        icss={[props.backdropICSS && { '&::backdrop': props.backdropICSS }]}
        ref={setDialogRef}
      >
        <Piv ref={setDialogContentRef} icss={{ display: 'contents' }}>
          {props.children}
        </Piv>
      </Piv>
    </Show>
  )
}

/**
 * detect whether should render `<Modal>`'s content in DOM
 */
function useShouldRenderDOMDetector(utils: { props: ModalProps; innerOpen: Accessor<boolean> }) {
  const [haveFirstOpened, setHaveFirstOpened] = createSignal(utils.innerOpen())

  // reflect to innerOpen() change
  createEffect(() => {
    const isOpen = utils.innerOpen()
    setHaveFirstOpened((b) => b || isOpen)
  })

  const shouldRenderDOM = () => {
    switch (utils.props.domRenderWhen ?? 'first-open') {
      case 'open': {
        return utils.innerOpen()
      }
      case 'always': {
        return true
      }
      case 'first-open': {
        return haveFirstOpened()
      }
    }
  }

  return { shouldRenderDOM }
}
