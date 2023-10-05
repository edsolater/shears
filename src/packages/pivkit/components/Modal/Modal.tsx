import { Accessor, Show, createEffect, createSignal } from 'solid-js'
import { createRef } from '../../hooks/createRef'
import { useClickOutside } from '../../domkit/hooks/useClickOutside'
import { useDOMEventListener } from '../../domkit/hooks/useDOMEventListener'
import { ICSS, KitProps, Piv, useKitProps } from '../../piv'
import { renderHTMLDOM } from '../../piv/propHandlers/renderHTMLDOM'

export interface ModalController {
  isOpen: boolean
  open(): void
  close(): void
  toggle(): void
}

export interface ModalProps {
  open?: boolean
  isModal?: boolean

  onClose?(): void

  /** style of backdrop */
  backdropICSS?: ICSS

  /**
   * control when to render DOM
   * @default 'first-open'
   */
  domRenderWhen?:
    | 'first-open' // not render DOM until open, but close will stay DOM [default]
    | 'open' // render DOM every open
    | 'always' // always stay DOM
}

export type ModalKitProps = KitProps<ModalProps>

export function Modal(kitProps: ModalKitProps) {
  const { props, lazyLoadController } = useKitProps(kitProps, {
    name: 'Modal',
  })
  lazyLoadController(() => ({
    get isOpen() {
      return innerOpen()
    },
    open: openDialog,
    close: closeDialog,
    toggle: toggleDialog,
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
    },
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
        render:self={(selfProps) => renderHTMLDOM('dialog', selfProps, { open: props.open && !props.isModal })}
        shadowProps={props}
        // TODO fix this
        // @ts-expect-error lack of icss type
        icss={{ '&::backdrop': props.backdropICSS }}
        domRef={setDialogRef}
      >
        <Piv domRef={setDialogContentRef} icss={{ display: 'contents' }}>
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
