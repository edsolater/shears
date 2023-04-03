import { createEffect, createSignal } from 'solid-js'
import { mergeRefs } from '../../../piv/utils/mergeRefs'
import { Accessify, useAccessifiedProps } from '../../utils/accessifyProps'
import { createRef } from '../createRef'
import { useCSSTransition } from './useCSSTransition'

type UseFadeInOptions = Accessify<{
  type?: 'collapse-type'

  show?: boolean
  appear?: boolean
}>

export function useCSSFadeIn(additionalOpts: UseFadeInOptions) {
  const opts = useAccessifiedProps(additionalOpts)

  // TODO: should have util 👉 covert from getter to signal
  const [show, setShow] = createSignal(opts.show ?? false)
  createEffect(() => {
    setShow(opts.show ?? false)
  })

  const [innerContentRef, innerContentRefSetter] = createRef<HTMLElement>()
  const haveInitTransition = () => opts.show && opts.appear

  const styleMethods = useFadeInPaddingEffect({ heightOrWidth: 'height' })

  const { refSetter, transitionProps } = useCSSTransition({
    show,
    onBeforeEnter(status) {
      const el = status.contentRef
      if (!el) return

      el.style.removeProperty('position')
      el.style.removeProperty('opacity')
      if (status.from === 'during-process') {
        styleMethods.toOriginalStyle(el)
      } else {
        el.style.setProperty('transition-property', 'none') // if element self has width(224px for example), it will have no effect to set width 0 then set with 224px
        styleMethods.toGhostStyle(el, { recordValue: true })
        el.clientHeight // force GPU to reflow this frame
        el.style.removeProperty('transition-property')
        styleMethods.toOriginalStyle(el)
      }
    },
    onAfterEnter(status) {
      const el = status.contentRef
      if (!el) return

      // if (init && !haveInitTransition) {
      if (!haveInitTransition()) {
        el.style.removeProperty('position')
        el.style.removeProperty('opacity')
      }
      styleMethods.clearUselessStyle(el)
      // onAfterEnter?.()
    },
    onBeforeLeave(status) {
      const el = status.contentRef
      if (!el) return
      if (status.from === 'during-process') {
        styleMethods.toGhostStyle(el)
      } else {
        styleMethods.toOriginalStyle(el, { recordValue: true })
        el.clientHeight
        styleMethods.toGhostStyle(el)
      }
    },
    onAfterLeave(status) {
      const el = status.contentRef
      if (!el) return
      styleMethods.clearUselessStyle(el)
      el.style.setProperty('position', 'absolute')
      el.style.setProperty('opacity', '0')
      //TODO: complete it
      // innerStyle.current = [baseTransitionStyle, { position: 'absolute', opacity: '0' }] as DivProps['style']
      // onAfterLeave?.()
    }
  })

  return {
    refSetter: mergeRefs(refSetter, innerContentRefSetter),
    transitionProps
  }
}

function useFadeInPaddingEffect({ heightOrWidth }: { heightOrWidth: 'height' | 'width' }) {
  let contentCachedTrueHeightOrWidth: number | undefined
  let contentCachedTruePadding: string | undefined
  return {
    toGhostStyle: (el: HTMLElement, options?: { recordValue?: boolean }) => {
      if (options?.recordValue) {
        contentCachedTrueHeightOrWidth = el[heightOrWidth === 'height' ? 'clientHeight' : 'clientWidth'] // cache for from 'during-process' fade in can't get true height
        // cache for from 'during-process' fade in can't get true padding
        contentCachedTruePadding = getComputedStyle(el).padding
      }
      el.style.setProperty(heightOrWidth, '0')
      el.style.setProperty('padding', '0')
    },
    toOriginalStyle: (el: HTMLElement, options?: { recordValue?: boolean }) => {
      if (options?.recordValue) {
        contentCachedTrueHeightOrWidth = el[heightOrWidth === 'height' ? 'clientHeight' : 'clientWidth'] // cache for from 'during-process' fade in can't get true height
        // cache for from 'during-process' fade in can't get true padding
        contentCachedTruePadding = getComputedStyle(el).padding
      }
      contentCachedTrueHeightOrWidth && el.style.setProperty(heightOrWidth, `${contentCachedTrueHeightOrWidth}px`)
      contentCachedTruePadding && el.style.setProperty('padding', contentCachedTruePadding)
    },
    clearUselessStyle: (el: HTMLElement) => {
      el.style.removeProperty(heightOrWidth)
      el.style.removeProperty('padding')
    }
  }
}
