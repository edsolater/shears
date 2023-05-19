import { Accessor, createEffect, onCleanup } from 'solid-js'
import { onEvent } from '../../domkit'

export type UseScrollDegreeDetectorOptions = {
  onReachBottom?: () => void
  reachBottomMargin?: number
}

export function useScrollDegreeDetector(
  ref: Accessor<HTMLElement | null | undefined>,
  options?: UseScrollDegreeDetectorOptions
) {
  let isReachedBottom = false

  const onScroll = () => {
    const el = ref()
    if (!el) return
    const { scrollHeight, scrollTop, clientHeight } = el
    const canScroll = scrollHeight > clientHeight
    const contentIsNotHeightEnoughToReachNearBottom = scrollHeight <= clientHeight + (options?.reachBottomMargin ?? 0)
    const scrollToNearBottom = scrollTop + clientHeight + (options?.reachBottomMargin ?? 0) >= scrollHeight
    const isNearlyReachBottom = canScroll && (scrollToNearBottom || contentIsNotHeightEnoughToReachNearBottom)
    if (isNearlyReachBottom && !isReachedBottom) {
      options?.onReachBottom?.()
      isReachedBottom = true
    }

    if (!isNearlyReachBottom && isReachedBottom) {
      isReachedBottom = false
    }
  }

  createEffect(() => {
    const el = ref()
    if (!el) return

    onScroll()
    const { cancel } = onEvent(el, 'scroll', onScroll, { passive: true })
    onCleanup(cancel)
  }, [ref])
  return { forceCalculate: onScroll /* TODO: don't invoke forceCalculate manually, just use mutationObserver */ }
}
