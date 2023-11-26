import { Accessor, Show, createEffect, createSignal, onMount } from 'solid-js'
import { useClickOutside } from '../../domkit/hooks/useClickOutside'
import { useDOMEventListener } from '../../domkit/hooks/useDOMEventListener'
import { createRef } from '../../hooks/createRef'
import { ICSS, KitProps, Piv, useKitProps } from '../../piv'
import { renderHTMLDOM } from '../../piv/propHandlers/renderHTMLDOM'
import { PopPortal } from '../PopPortal'
import { shrinkFn } from '@edsolater/fnkit'
import { option } from '@raydium-io/raydium-sdk'

export interface ModalController {
  isOpen: boolean
  open(): void
  close(): void
  toggle(): void
}

export interface ModalProps {
  open?: boolean
  /** modal title */
  title?: string

  onClose?(): void
  onOpen?(): void

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
  const { props, lazyLoadController, shadowProps } = useKitProps(kitProps, { name: 'Modal' })
  lazyLoadController(() => ({
    get isOpen() {
      return innerOpen()
    },
    open: openDialog,
    close: closeDialog,
    toggle: toggleDialog,
  }))
  const [dialogDOM, setDialogDOM] = createRef<HTMLDialogElement>()
  const [dialogContentDOM, setDialogContentDOM] = createRef<HTMLDivElement>()
  const { innerOpen, openDialog, closeDialog, toggleDialog } = useModalTriggerState({
    open: () => Boolean(props.open),
    dialogDOM,
    dialogContentDOM,
    onClose(byDOM) {
      props.onClose?.()
      if (byDOM) dialogDOM()?.close()
    },
    onOpen() {
      props.onOpen?.()
      dialogDOM()?.showModal()
    },
  })
  const { shouldRenderDOM } = useShouldRenderDOMDetector({ props, innerOpen })

  // initly load modal show
  createEffect(() => {
    if (props.open) {
      openDialog()
    }
  })

  // not propagate original keydown event
  useDOMEventListener(dialogDOM, 'keydown', ({ ev }) => {
    ev.stopPropagation()
    return ev.preventDefault()
  })

  // register click outside
  useClickOutside(dialogContentDOM, {
    disable: () => !innerOpen(),
    onClickOutSide: () => {
      closeDialog()
    },
  })

  return (
    <PopPortal name='dialog'>
      <Show when={shouldRenderDOM()}>
        <Piv<'dialog'>
          render:self={(selfProps) => renderHTMLDOM('dialog', selfProps)}
          domRef={setDialogDOM}
          shadowProps={shadowProps}
          htmlProps={{ role: 'dialog' }}
          // @ts-expect-error lack of icss type
          icss={{
            border: 'none',
            padding: '0',
            background: 'transparent',
            overflowY: 'visible',
            maxHeight: '100dvh',
            maxWidth: '100dvw',
            '&::backdrop': props.backdropICSS,
          }}
        >
          <Piv domRef={setDialogContentDOM} icss={{ display: 'contents' }}>
            {props.children}
          </Piv>
        </Piv>
      </Show>
    </PopPortal>
  )
}

function useModalTriggerState(config: {
  open?: Accessor<boolean>
  dialogDOM: Accessor<HTMLDialogElement | undefined>
  dialogContentDOM: Accessor<HTMLDivElement | undefined>
  onOpen?: () => void
  onClose?: (
    /**
     * if it's caused by dom, it should set false
     * @default true
     */
    byDOM?: boolean,
  ) => void
}) {
  const [innerOpen, setInnerOpen] = createSignal(shrinkFn(config.open) ?? false)
  function openDialog() {
    setInnerOpen(true)
    config.onOpen?.()
  }
  function closeDialog(options?: {
    /**
     * if it's caused by dom, it should set false
     * @default true
     */
    byDOM?: boolean
  }) {
    setInnerOpen(false)
    config.onClose?.(options?.byDOM ?? true)
  }
  function toggleDialog() {
    innerOpen() ? closeDialog() : openDialog()
  }

  // sync original's close event with innwe state
  useDOMEventListener(config.dialogDOM, 'close', () => closeDialog({ byDOM: false }))

  return { innerOpen, openDialog, closeDialog, toggleDialog }
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
