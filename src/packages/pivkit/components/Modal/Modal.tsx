import { Accessor, Show, createEffect, createSignal, onMount } from 'solid-js'
import { useClickOutside } from '../../domkit/hooks/useClickOutside'
import { useDOMEventListener } from '../../domkit/hooks/useDOMEventListener'
import { createRef } from '../../hooks/createRef'
import { ICSS, KitProps, Piv, useKitProps } from '../../piv'
import { renderHTMLDOM } from '../../piv/propHandlers/renderHTMLDOM'
import { PopPortal } from '../PopPortal'

export interface ModalController {
  isOpen: boolean
  open(): void
  close(): void
  toggle(): void
}

export interface ModalProps {
  open?: boolean

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

  const [innerOpen, setInnerOpen] = createSignal(Boolean(props.open))
  const { shouldRenderDOM } = useShouldRenderDOMDetector({ props, innerOpen })

  // initly load modal show
  createEffect(() => {
    if (props.open) {
      openDialog()
    }
  })

  onMount(() => {
    if (innerOpen()) {
      openDialog()
    }
  })
  // register onClose callback
  useDOMEventListener(dialogDOM, 'close', () => closeDialog({ witDOMChange: false }))
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

  // user action: open dialog
  const openDialog = () => {
    setInnerOpen(true)
    dialogDOM()?.showModal()
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
    if (options?.witDOMChange ?? true) dialogDOM()?.close()
    props.onClose?.()
  }

  // user action: toggle(open & close) dialog
  function toggleDialog() {
    innerOpen() ? closeDialog() : openDialog()
  }

  return (
    <PopPortal name='dialog'>
      <Show when={shouldRenderDOM()}>
        <Piv<'dialog'>
          render:self={(selfProps) => renderHTMLDOM('dialog', selfProps)}
          domRef={setDialogDOM}
          shadowProps={shadowProps}
          htmlProps={{ role: 'dialog' }}
          // @ts-expect-error lack of icss type
          icss={{ '&::backdrop': props.backdropICSS }}
        >
          <Piv domRef={setDialogContentDOM} icss={{ display: 'contents' }}>
            {props.children}
          </Piv>
        </Piv>
      </Show>
    </PopPortal>
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
