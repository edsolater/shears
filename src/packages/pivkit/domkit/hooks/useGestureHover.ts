//#region ------------------- hook: useHover() -------------------

import { Accessor, createEffect, onCleanup } from 'solid-js'
import { createToggle } from '../../hooks/createToggle'

export interface GestureHoverOptions {
  el: Accessor<HTMLElement | undefined | null>
  triggerDelay?: number
  disable?: boolean
  onHoverStart?: (info: { ev: PointerEvent }) => void
  onHoverEnd?: (info: { ev: PointerEvent }) => void
  onHover?: (info: { ev: PointerEvent; is: 'start' | 'end' }) => void
}
export interface GestureHoverStates {
  isHover: Accessor<boolean>
}

export function useGestureHover(options: GestureHoverOptions): GestureHoverStates {
  const [isHover, { on: turnonHover, off: turnoffHover }] = createToggle()

  createEffect(() => {
    if (options.disable) return
    const el = options.el()
    if (!el) return
    let hoverDelayTimerId: number | undefined | NodeJS.Timeout
    const hoverStartHandler = (ev: PointerEvent) => {
      if (options.disable) return
      if (options.triggerDelay) {
        hoverDelayTimerId = setTimeout(() => {
          hoverDelayTimerId = undefined
          turnonHover()
          options.onHover?.({ ev, is: 'start' })
          options.onHoverEnd?.({ ev })
        }, options.triggerDelay)
      } else {
        turnonHover()
        options.onHover?.({ is: 'start', ev })
        options.onHoverStart?.({ ev })
      }
    }
    const hoverEndHandler = (ev: PointerEvent) => {
      if (options.disable) return
      turnoffHover()
      options.onHover?.({ ev, is: 'end' })
      options.onHoverEnd?.({ ev })
      clearTimeout(hoverDelayTimerId)
      hoverDelayTimerId = undefined
    }

    el.addEventListener('pointerenter', hoverStartHandler)
    el.addEventListener('pointerleave', hoverEndHandler)
    el.addEventListener('pointercancel', hoverEndHandler)
    onCleanup(() => {
      el.removeEventListener('pointerenter', hoverStartHandler)
      el.removeEventListener('pointerleave', hoverEndHandler)
      el.removeEventListener('pointercancel', hoverEndHandler)
    })
  })

  return { isHover }
}
