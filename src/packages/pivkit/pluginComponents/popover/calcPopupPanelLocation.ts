import { IStyle } from '../../piv'
import { PopoverPlacement } from './type'

export type PopupStyleInfo = {
  // relative to viewport
  panel: IStyle
  // relative to screen. arrow bottom center
  arrow: IStyle
}

/**
 * ASK: What's the difference from <Tooltip>?
 * ANS: 1. <Tooltip> is just a sigle wrapper, but <Popover> is more  complex
 * 2. <Tooltip> should just show some infomation, but <Popover>'s content can interactive
 */
const POPOVER_GAP = 8
const POPOVER_VIEWPORT_BOUNDARY_INSET = 6

export const calcPopupPanelLocation = ({
  buttonElement,
  panelElement,
  placement = 'top',
  cornerOffset = 0,
  popoverGap = POPOVER_GAP,
  viewportBoundaryInset = POPOVER_VIEWPORT_BOUNDARY_INSET,
}: {
  buttonElement: HTMLElement
  panelElement: HTMLElement
  placement?: PopoverPlacement

  /** for corner placement like 'top-left' 'top-right etc. */
  cornerOffset?: number
  /** gap between `<PopoverButton>` and `<PopoverPanel>`*/
  popoverGap?: number
  /** to leave some space when touch the viewport boundary */
  viewportBoundaryInset?: number
}): PopupStyleInfo | undefined => {
  // must in some computer
  if (!globalThis.document) return undefined
  const rect = panelElement.getBoundingClientRect()
  const panelWidth = rect.width
  const panelHeight = rect.height

  const customizedViewportWidth = globalThis.document.documentElement.clientWidth - viewportBoundaryInset * 2
  const customizedViewportHeight = globalThis.document.documentElement.clientHeight - viewportBoundaryInset * 2
  const customizedViewportTop = viewportBoundaryInset
  const customizedViewportLeft = viewportBoundaryInset
  const customizedViewportRight = customizedViewportLeft + customizedViewportWidth
  const customizedViewportBottom = customizedViewportTop + customizedViewportHeight

  const buttonRect = buttonElement.getBoundingClientRect()
  const buttonWidth = buttonRect.width
  const buttonHeight = buttonRect.height
  const buttonTop = buttonRect.top
  const buttonLeft = buttonRect.left
  const buttonRight = buttonLeft + buttonWidth
  const buttonBottom = buttonTop + buttonHeight
  return {
    panel:
      placement === 'top'
        ? {
            bottom: `${buttonHeight + popoverGap}px`,
            left: '50%',
            transform: 'translateX(-50%)',
          }
        : {},
    arrow: {},
  }
}

const clamp = (current: number, payload: { min: number; max: number }) =>
  Math.max(payload.min, Math.min(payload.max, current))
