import { Accessor, createEffect, createMemo, createSignal } from 'solid-js'
import { IStyle } from '../../piv/propHandlers'
import { PopupStyleInfo, calcPopupPanelLocation } from './calcPopupPanelLocation'
import { PopoverPlacement } from './type'
import { mergeObjects } from '@edsolater/fnkit'

// for fade in effect (fade-in is caused by )
// const popupOrigins = {
//   top: 'bottom',
//   'top-left': 'bottom-left',
//   'top-right': 'bottom-right',
//   right: 'left',
//   'right-top': 'top-left',
//   'right-bottom': 'bottom-left',
//   left: 'right',
//   'left-top': 'top-right',
//   'left-bottom': 'bottom-right',
//   bottom: 'top',
//   'bottom-left': 'top-left',
//   'bottom-right': 'top-right',
// }

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
  const [popupStyles, setPopupStyles] = createSignal<PopupStyleInfo>()

  // calculate panelCoordinates when domRef is attached
  createEffect(() => {
    // must in some computer
    if (!globalThis.document) return
    const buttonElement = buttonDom()
    const panelElement = panelDom()
    if (!buttonElement || !panelElement) return

    const styles = calcPopupPanelLocation({
      buttonElement: buttonElement,
      panelElement: panelElement,
      placement,
      cornerOffset,
      popoverGap,
      viewportBoundaryInset,
    })
    setPopupStyles(styles)
  })

  const panelStyle = createMemo(() =>
    mergeObjects(popupStyles()?.panel, {
      display: isTriggerOn() ? '' : 'none',
    } satisfies IStyle),
  )

  return { locationInfo: popupStyles, panelStyle }
}
