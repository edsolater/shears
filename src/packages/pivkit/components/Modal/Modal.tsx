import { shrinkFn } from '@edsolater/fnkit'
import { Accessor, Show, createContext, createEffect, createSignal, useContext } from 'solid-js'
import { useClickOutside } from '../../domkit/hooks/useClickOutside'
import { useDOMEventListener } from '../../domkit/hooks/useDOMEventListener'
import { createRef } from '../../hooks/createRef'
import { ICSS, KitProps, Piv, useKitProps } from '../../piv'
import { renderHTMLDOM } from '../../piv/propHandlers/renderHTMLDOM'
import { PopPortal } from '../PopPortal'
import { createController } from '../../utils/createController'

export interface ModalController {
  dialogDOM?(): Accessor<HTMLDialogElement | undefined>
  dialogContentDOM?(): Accessor<HTMLDivElement | undefined>
  isOpen: boolean
  /** modal title */
  title(): Accessor<string>
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

export const ModalContext = createContext<ModalController>()

export function Modal(kitProps: ModalKitProps) {
  const modalController = createController<ModalController>(() => ({
    dialogDOM,
    dialogContentDOM,
    title: () => props.title,
    /** is dialog open */
    get isOpen() {
      return innerOpen()
    },
    open: open,
    close: close,
    toggle: toggle,
  }))

  const { props, shadowProps } = useKitProps(kitProps, {
    name: 'Modal',
    controller: () => modalController,
  })
  const [dialogDOM, setDialogDOM] = createRef<HTMLDialogElement>()
  const [dialogContentDOM, setDialogContentDOM] = createRef<HTMLDivElement>()
  const {
    isOpen: innerOpen,
    open,
    close,
    toggle,
  } = useDisclosure({
    open: () => Boolean(props.open),
    onClose(affectDOM) {
      props.onClose?.()
      if (affectDOM) dialogDOM()?.close()
    },
    onOpen() {
      props.onOpen?.()
      dialogDOM()?.showModal()
    },
  })
  const { shouldRenderDOM } = useShouldRenderDOMDetector({ props, innerOpen })

  // sync dislog's  build-in close event with inner state
  useDOMEventListener(dialogDOM, 'close', () => close({ byDOM: false }))

  // initly load modal show
  createEffect(() => {
    if (props.open) {
      innerOpen()
    }
  })

  // not propagate original keydown event
  useDOMEventListener(dialogDOM, 'keydown', ({ ev }) => {
    ev.stopPropagation()
    return ev.preventDefault()
  })

  // click outside to close dialog
  useClickOutside(dialogContentDOM, {
    disable: () => !innerOpen(),
    onClickOutSide: () => {
      close()
    },
  })

  return (
    <ModalContext.Provider value={modalController}>
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
    </ModalContext.Provider>
  )
}

function useDisclosure(config: {
  open?: Accessor<boolean>
  onOpen?: () => void
  onClose?: (
    /**
     * if it's caused by dom, it should set false
     * @default true
     */
    byDOM?: boolean,
  ) => void
}) {
  const [isOpen, setInnerOpen] = createSignal(shrinkFn(config.open) ?? false)
  function open() {
    setInnerOpen(true)
    config.onOpen?.()
  }
  function close(options?: {
    /**
     * if it's caused by dom, it should set false
     * @default true
     */
    byDOM?: boolean
  }) {
    setInnerOpen(false)
    config.onClose?.(options?.byDOM ?? true)
  }
  function toggle() {
    isOpen() ? close() : open()
  }

  return { isOpen, open, close, toggle }
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
