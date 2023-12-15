import { Accessor, createEffect, onCleanup } from 'solid-js'
import { EventCallback, addEventListener } from '..'
import { ElementAccessors, getElementsFromAccessors } from '../../utils/elementAccessors'
import { shrinkFn } from '@edsolater/fnkit'

type OnClickOutSideCallback = (
  payload: EventCallback<keyof HTMLElementEventMap, HTMLElement | Document | Window | undefined | null>
) => void

export type UseClickOutsideOptions =
  | {
      disabled?: boolean | Accessor<boolean>
      onClickOutSide?: OnClickOutSideCallback
    }
  | OnClickOutSideCallback

  /**
   * inner use (bubbled to root) click event's `event.composedPath()` to check if the click event is outside of the target elements
   * @param els can be a single element or an array of elements or even a function that returns an element or an array of elements
   * @param options 
   */
export function useClickOutside(els: ElementAccessors, options?: UseClickOutsideOptions) {
  const parasedOptions = typeof options === 'function' ? { onClickOutSide: options } : options
  const getOption = () => parasedOptions
  createEffect(() => {
    const targetElements = getElementsFromAccessors(els)
    const { abort: cancel } = addEventListener(
      globalThis.document,
      'click',
      (payload) => {
        const isDisabled = shrinkFn(getOption()?.disabled)
        if (isDisabled) return
        if (!targetElements.length) return
        const path = payload.ev.composedPath()
        const isTargetInPath = targetElements.some((el) => el && path.includes(el))
        if (isTargetInPath) return
        parasedOptions?.onClickOutSide?.(payload)
      },
      { capture: true }
    )
    onCleanup(cancel)
  })
}
