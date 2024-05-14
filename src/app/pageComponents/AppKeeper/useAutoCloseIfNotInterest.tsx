import { shrinkFn, type AnyFn } from "@edsolater/fnkit"
import type { Accessify, ElementRefs } from "@edsolater/pivkit"
import { getElementFromRefs, listenDomEvent, useGestureHover } from "@edsolater/pivkit"
import { createEffect, createSignal, onCleanup, type Accessor } from "solid-js"

type AutoCloseIfNotInterestOptions = {
  el: ElementRefs
  enabled?: boolean | Accessify<boolean>
  onClose?: AnyFn
  onOpen?: AnyFn
  /**
   * @default 200
   */
  delay?: number
}

export function useAutoCloseIfNotInterest(options: AutoCloseIfNotInterestOptions) {
  const { isHover } = useGestureHover({ el: options.el })
  const { isInterested } = useIsElementInterestedChecker({ el: options.el })

  createEffect(() => {
    if ("enabled" in options && !shrinkFn(options.enabled)) return
    if (!isHover() && !isInterested()) {
      const timeId = setTimeout(() => {
        options.onClose?.()
      }, options.delay ?? 200)
      onCleanup(() => {
        clearTimeout(timeId)
      })
    } else {
      const timeId = setTimeout(() => {
        options.onOpen?.()
      }, options.delay ?? 200)
      onCleanup(() => {
        clearTimeout(timeId)
      })
    }
  })
}

type ElementInterestedCheckerOptions = {
  el: ElementRefs
  enabled?: boolean | Accessify<boolean>
  action?: AnyFn
}
/**
 * check if the element is interested
 */
export function useIsElementInterestedChecker(options: ElementInterestedCheckerOptions): {
  isInterested: Accessor<boolean>
} {
  const [isInterested, setIsInterested] = createSignal(false)

  createEffect(() => {
    const els = getElementFromRefs(options.el)
    if (!els.length) return
    const enable = "enabled" in options ? shrinkFn(options.enabled) : true
    if (!enable) return
    els.forEach((el) => {
      const { cancel: cancel1 } = listenDomEvent(el, "focusin", () => {
        setIsInterested(true)
      })
      onCleanup(cancel1)
      const { cancel: cancel2 } = listenDomEvent(el, "focusout", () => {
        setIsInterested(false)
      })
      onCleanup(cancel2)
    })
  })

  return {
    isInterested,
  }
}
