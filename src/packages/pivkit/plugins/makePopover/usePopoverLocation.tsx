import { Accessor, createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { IStyle } from '../../piv/propHandlers'
import { runInNextLoop } from '../../utils/runInNextLoop'
import { PopupLocationInfo, calcPopupPanelLocation } from './calcPopupPanelLocation'
import { getScrollParents } from './getScrollParents'
import { PopoverPlacement } from './type'

// for fade in effect (fade-in is caused by )
const popupOrigins = {
  top: 'bottom',
  'top-left': 'bottom-left',
  'top-right': 'bottom-right',
  right: 'left',
  'right-top': 'top-left',
  'right-bottom': 'bottom-left',
  left: 'right',
  'left-top': 'top-right',
  'left-bottom': 'bottom-right',
  bottom: 'top',
  'bottom-left': 'top-left',
  'bottom-right': 'top-right',
}

export type PopoverLocationHookOptions = {
  buttonDom: Accessor<HTMLElement | undefined>
  panelDom: Accessor<HTMLElement | undefined>
  isTriggerOn: Accessor<boolean>
  placement?: PopoverPlacement
  /** for corner placement like 'top-left' 'top-right etc. */
  cornerOffset?: number
  /** gap between `<PopoverButton>` and `<PopoverPanel>`*/
  popoverGap?: number
  /** to leave some space when touch the viewport boundary */
  viewportBoundaryInset?: number
}

export function usePopoverLocation({
  buttonDom,
  panelDom,
  isTriggerOn,
  placement,
  cornerOffset,
  popoverGap,
  viewportBoundaryInset,
}: PopoverLocationHookOptions) {
  const [panelCoordinates, setPanelCoordinates] = createSignal<PopupLocationInfo>()

  const update = () => {
    // must in some computer
    if (!globalThis.document) return
    const buttonElement = buttonDom()
    const panelElement = panelDom()
    if (!buttonElement || !panelElement) return

    const coors = calcPopupPanelLocation({
      buttonElement: buttonElement,
      panelElement: panelElement,
      placement,
      cornerOffset,
      popoverGap,
      viewportBoundaryInset,
    })
    setPanelCoordinates(coors)
  }

  // listen to button's resize for dom:layout
  createEffect(() => {
    const buttonElement = buttonDom()
    const panelElement = panelDom()
    if (!buttonElement || !panelElement) return
    const observer = new ResizeObserver(() => {
      if (isTriggerOn()) {
        runInNextLoop(update) // calc coor in next frame for safer lifecycle:layout
      }
    })
    observer.observe(buttonElement)
    observer.observe(panelElement)
    onCleanup(() => {
      observer.disconnect()
    })
  })

  // listen to BUTTON parent's scroll
  createEffect(() => {
    const buttonElement = buttonDom()
    if (!buttonElement) return
    const buttonScrollParents = buttonElement ? getScrollParents(buttonElement) : []
    const parents = [...buttonScrollParents]
    parents.forEach((parent) => {
      parent.addEventListener('scroll', update, { passive: true })
      globalThis.addEventListener?.('resize', update, { passive: true })
    })
    onCleanup(() => {
      parents.forEach((parent) => {
        parent.removeEventListener('scroll', update)
        globalThis.removeEventListener?.('resize', update)
      })
    })
  })

  const panelStyle = createMemo(() => {
    const coor = panelCoordinates()
    const style =
      isTriggerOn() && coor
        ? ({
            left: coor.panelLeft + 'px',
            top: coor.panelTop + 'px',
          } as IStyle)
        : ({ display: 'none' } as IStyle)
    return style
  })

  return { locationInfo: panelCoordinates, forceUpdateLocation: update, panelStyle }
}

export function usePopoverPanelLocation({
  buttonDom,
  panelDom,
  isTriggerOn,
  placement,
  cornerOffset,
  popoverGap,
  viewportBoundaryInset,
}: PopoverLocationHookOptions) {
  const [panelCoordinates, setPanelCoordinates] = createSignal<PopupLocationInfo>()

  const update = () => {
    // must in some computer
    if (!globalThis.document) return
    const buttonElement = buttonDom()
    const panelElement = panelDom()
    if (!buttonElement || !panelElement) return

    const coors = calcPopupPanelLocation({
      buttonElement: buttonElement,
      panelElement: panelElement,
      placement,
      cornerOffset,
      popoverGap,
      viewportBoundaryInset,
    })
    setPanelCoordinates(coors)
  }

  const panelStyle = createMemo(() => {
    const coor = panelCoordinates()
    const style =
      isTriggerOn() && coor
        ? ({
            left: coor.panelLeft + 'px',
            top: coor.panelTop + 'px',
          } as IStyle)
        : ({ display: 'none' } as IStyle)
    return style
  })

  return { locationInfo: panelCoordinates, forceUpdateLocation: update, panelStyle }
}
