import { flap, MayArray, MayFn, shrinkFn, switchCase } from '@edsolater/fnkit'
import { Accessor, createEffect, createMemo, createSignal, on, onCleanup } from 'solid-js'
import { addEventListener } from '../domkit'
import { createRef } from '../hooks/createRef'
import { createPlugin, CSSObject, mergeProps, PivProps } from '../piv'
import { Accessify, useAccessifiedProps } from '../utils/accessifyProps'
import { createController } from '../utils/createController'
import { runtimeObject } from '../../fnkit/runtimeObject'
import { get } from '../../../app/utils/dataTransmit/itemMethods'
import { parallelAsyncTasks } from '../../fnkit'

type TransitionPhase =
  | 'hidden' /* UI unvisiable */
  | 'shown' /* UI visiable and stable(not in transition) */
  | 'during-process'

type TransitionCurrentPhasePropsName = 'enterFrom' | 'enterTo' | 'leaveFrom' | 'leaveTo'

export interface CSSTransactionOptions {
  cssTransitionDurationMs?: Accessify<number | undefined, TransitionController>
  cssTransitionTimingFunction?: CSSObject['transitionTimingFunction']

  /* detect transition should be turn on */
  show?: Accessify<boolean | undefined, TransitionController>

  /** will trigger props:onBeforeEnter() if init props:show  */
  appear?: Accessify<boolean | undefined, TransitionController>

  enterProps?: PivProps<any, TransitionController>
  leaveProps?: PivProps<any, TransitionController>

  enterFromProps?: PivProps<any, TransitionController>
  enterToProps?: PivProps<any, TransitionController>

  leaveFromProps?: PivProps<any, TransitionController>
  leaveToProps?: PivProps<any, TransitionController>

  /** enterFrom + leaveTo */
  hideProps?: PivProps<any, TransitionController> // shortcut for both enterFrom and leaveTo
  /** enterTo + leaveFrom */
  showProps?: PivProps<any, TransitionController> // shortcut for both enterTo and leaveFrom

  onBeforeEnter?: (payloads: {
    el: HTMLElement | undefined
    from: TransitionPhase
    to: 'shown' | 'hidden'
    isFromAbortted: boolean
  }) => void
  onAfterEnter?: (payloads: { el: HTMLElement | undefined; from: TransitionPhase; to: 'shown' | 'hidden' }) => void
  onBeforeLeave?: (payloads: {
    el: HTMLElement | undefined
    from: TransitionPhase
    to: 'shown' | 'hidden'
    isFromAbortted: boolean
  }) => void
  onAfterLeave?: (payloads: { el: HTMLElement | undefined; from: TransitionPhase; to: 'shown' | 'hidden' }) => void

  presets?: MayArray<MayFn<Omit<CSSTransactionOptions, 'presets'>>> //🤔 is it plugin? No, pluginHook can't have plugin prop
  // children?: ReactNode | ((state: { phase: TransitionPhase }) => ReactNode)
}

interface TransitionController {
  contentDom: Accessor<HTMLElement | undefined>
  from: Accessor<TransitionPhase>
  to: Accessor<TransitionPhase>
}

export function useCSSTransition(additionalOpts: CSSTransactionOptions = {}) {
  const controller: TransitionController = createController(() => ({
    from: currentPhase,
    to: targetPhase,
    contentDom,
  }))
  const opts = useAccessifiedProps(additionalOpts, controller)
  const [contentDom, setContentDom] = createRef<HTMLElement>()
  const transitionPhaseProps = createMemo(() => {
    const basic = {
      transition: `${opts.cssTransitionDurationMs ?? 250}ms`,
      transitionTimingFunction: opts.cssTransitionTimingFunction,
    }
    const presets = flap(opts.presets)
    return {
      enterFrom: mergeProps(
        presets.map((i) => shrinkFn(i)?.enterFromProps),
        opts.enterProps,
        opts.enterFromProps ?? opts.hideProps,
        { style: basic },
      ) as PivProps,
      enterTo: mergeProps(
        presets.map((i) => shrinkFn(i)?.enterToProps),
        opts.enterProps,
        opts.enterToProps ?? opts.showProps,
        { style: basic },
      ) as PivProps,
      leaveFrom: mergeProps(
        presets.map((i) => shrinkFn(i)?.leaveFromProps),
        opts.leaveProps,
        opts.leaveFromProps ?? opts.showProps,
        { style: basic },
      ) as PivProps,
      leaveTo: mergeProps(
        presets.map((i) => shrinkFn(i)?.leaveToProps),
        opts.leaveProps,
        opts.leaveToProps ?? opts.hideProps,
        { style: basic },
      ) as PivProps,
    } as Record<TransitionCurrentPhasePropsName, PivProps>
  })

  const [currentPhase, setCurrentPhase] = createSignal<TransitionPhase>(opts.show && !opts.appear ? 'shown' : 'hidden')
  const targetPhase = createMemo(() => (opts.show ? 'shown' : 'hidden'))
  // this accessor is to hold collapse state
  const opened = createMemo(() => targetPhase() === 'shown')
  const currentPhasePropsName = createMemo<TransitionCurrentPhasePropsName>(() =>
    targetPhase() === 'shown'
      ? currentPhase() === 'hidden'
        ? 'enterFrom'
        : 'enterTo'
      : currentPhase() === 'shown'
        ? 'leaveFrom'
        : 'leaveTo',
  )

  // set data-** to element for semantic
  createEffect(() => {
    const el = contentDom()
    if (el) {
      el.dataset['from'] = currentPhase()
      el.dataset['to'] = targetPhase()
    }
  })

  // make inTransition during state sync with UI event
  // const hasSetOnChangeCallback = useRef(false)
  createEffect(() => {
    const el = contentDom()
    if (!el) return
    const subscription = addEventListener(
      el,
      'transitionend',
      () => {
        setCurrentPhase(targetPhase())
      },
      { onlyTargetIsSelf: true /* not event fired by bubbled */ },
    )
    // const subscription2 = addEventListener(
    //   el,
    //   'transitioncancel',
    //   () => {
    //     setCurrentPhase(targetPhase())
    //   },
    //   { onlyTargetIsSelf: true /* not event fired by bubbled */ },
    // )
    onCleanup(() => {
      subscription.abort()
      // subscription2.abort()
    })
  })

  // change current phase by target phase
  createEffect(() => {
    if (targetPhase() !== currentPhase() && currentPhase() !== 'during-process') {
      setCurrentPhase('during-process')
    }
  })

  // invoke callbacks
  createEffect(
    on(
      [currentPhase, targetPhase],
      ([currentPhase, targetPhase], prev) => {
        const el = contentDom()
        const [prevCurrentPhase, prevTargetPhase]: [phase?: TransitionPhase, to?: 'hidden' | 'shown'] = prev ?? []

        const status = {
          el,
          from: currentPhase,
          to: targetPhase,
          prevPhase: prevCurrentPhase,
          isFromAbortted: currentPhase === 'during-process' && prevCurrentPhase === 'during-process', // not right
        } as const
        // -------- process judgers --------
        const isFirstRender = prevCurrentPhase === undefined
        const isCurrentPhaseShown = currentPhase === 'shown'
        const isCurrentPhaseHidden = currentPhase === 'hidden'
        const isCurrentPhaseDuringProcess = currentPhase === 'during-process'
        const isPreviousPhaseDuringProcess = prevCurrentPhase === 'during-process'
        const isTargetShown = targetPhase === 'shown'
        const isTargetHidden = targetPhase === 'hidden'

        // -------- lifecycle judgers --------
        const isAfterEnter = isCurrentPhaseShown && isTargetShown
        const isAfterLeave = isCurrentPhaseHidden && isTargetHidden
        const isBeforeEnter =
          (isCurrentPhaseHidden || (isCurrentPhaseDuringProcess && isPreviousPhaseDuringProcess) || isFirstRender) &&
          isTargetShown
        const isBeforeLeave =
          (isCurrentPhaseShown || (isCurrentPhaseDuringProcess && isPreviousPhaseDuringProcess) || isFirstRender) &&
          isTargetHidden

        switchCase(true, [
          [isAfterEnter, () => opts.onAfterEnter?.(status)],
          [isAfterLeave, () => opts.onAfterLeave?.(status)],
          [isBeforeEnter, () => opts.onBeforeEnter?.(status)],
          [isBeforeLeave, () => opts.onBeforeLeave?.(status)],
        ])
      },
      { defer: true },
    ),
  )

  const transitionProps = () => {
    const mergeProps = transitionPhaseProps()[currentPhasePropsName()]
    return mergeProps
  }

  return { refSetter: setContentDom, transitionProps, opened }
}

export function createTransitionPlugin(options?: Omit<CSSTransactionOptions, 'show'>) {
  const [show, setShow] = createSignal(false)

  function toggle() {
    setShow((b) => !b)
  }
  function close() {
    setShow(false)
  }
  function open() {
    setShow(true)
  }

  const { refSetter, transitionProps, opened } = useCSSTransition({
    show,
    ...options,
  })

  const controller = {
    opened,
    toggle,
    open,
    close,
  }

  return {
    plugin: createPlugin(
      () => () =>
        // does must use a high function ?
        runtimeObject<PivProps>({
          // if not use runtimeObject, the props will be consumed too early
          shadowProps: () => transitionProps(),
          domRef: () => refSetter,
        }),
    ),
    controller,
  }
}
/** will dynamic collapse element height from 'auto' */
// could it from auto to auto? 🤔
export function createCSSCollapsePlugin(options?: {
  ignoreEnterTransition?: boolean
  ignoreLeaveTransition?: boolean
  durationMs?: number
}) {
  let inTransitionDuration = false // flag for transition is start from transition cancel
  let cachedElementHeight: number | undefined = undefined // for transition start may start from transition cancel, which height is not correct
  const { plugin, controller } = createTransitionPlugin({
    cssTransitionDurationMs: options?.durationMs ?? 250,
    cssTransitionTimingFunction: 'ease-out',
    enterProps: {
      icss: {
        userSelect: 'none',
      },
    },
    leaveProps: {
      icss: {
        userSelect: 'none',
      },
    },
    hideProps: {
      icss: {
        opacity: 0,
      },
    },
    showProps: {
      icss: {
        opacity: 1,
      },
    },
    onBeforeEnter({ el }) {
      //why not invoked? 🤔
      if (options?.ignoreEnterTransition) {
        resumeDOMCache(el)
        el?.style.removeProperty('position')
        el?.style.removeProperty('visibility')
        return
      }

      setTimeout(() => {
        if (!el) return
        el.style.removeProperty('position')
        el.style.removeProperty('visibility')

        if (inTransitionDuration) {
          if (cachedElementHeight) el.style.setProperty('height', cachedElementHeight + 'px')
        } else {
          const { height } = el.getBoundingClientRect()

          cachedElementHeight = height
          const originalTransitionProps = getComputedStyle(el).transition
          el.style.setProperty('transition', 'none')

          el.clientHeight

          // frequent ui action may cause element havn't attach to DOM yet, when occors, just ignore it.
          el.style.setProperty('height', '0')
          el.clientHeight
          el.style.setProperty('transition', originalTransitionProps)
          /// Force bowser to paint the frame  🤯🤯🤯🤯
          el.style.setProperty('height', height + 'px')
        }
        inTransitionDuration = true
      })
    },
    onAfterEnter({ el }) {
      el?.style.removeProperty('height')
      inTransitionDuration = false
    },
    onBeforeLeave({ el }) {
      if (!el) return
      if (options?.ignoreLeaveTransition) return
      if (inTransitionDuration) {
        el.style.setProperty('height', `0`)
      } else {
        const { height } = el.getBoundingClientRect()
        cachedElementHeight = height

        el.style.setProperty('height', height + 'px')
        // Force bowser to paint the frame  🤯🤯🤯🤯
        el.clientHeight
        el.style.setProperty('height', '0')
      }
      inTransitionDuration = true
    },
    onAfterLeave({ el }) {
      el?.style.removeProperty('height')
      el?.style.setProperty('position', 'absolute')
      el?.style.setProperty('visibility', 'hidden')
      destoryDOMCache(el)
      inTransitionDuration = false
    },
  })

  function resumeDOMCache(element: HTMLElement | undefined) {
    element?.style.removeProperty('pointer-events')
  }

  // innerChildren.current = null // clean from internal storage to avoid still render dom
  function destoryDOMCache(element: HTMLElement | undefined) {
    element?.style.setProperty('pointer-events', 'none')
  }

  return {
    plugin: plugin,
    controller,
  }
}

/**
 * can create transition from one height:auto to another height:auto
 */
export function createAutoSizeTransitionPlugin(options?: {
  ignoreEnterTransition?: boolean
  ignoreLeaveTransition?: boolean
}) {
  let inTransitionDuration = false // flag for transition is start from transition cancel
  let cachedElementHeight: number | undefined = undefined // for transition start may start from transition cancel, which height is not correct
  const { plugin, controller } = createTransitionPlugin({
    cssTransitionDurationMs: 1000,
    enterProps: {
      icss: {
        userSelect: 'none',
      },
    },
    leaveProps: {
      icss: {
        userSelect: 'none',
      },
    },
    hideProps: {
      icss: {
        opacity: 0,
      },
    },
    showProps: {
      icss: {
        opacity: 1,
      },
    },
    onBeforeEnter({ el }) {
      //why not invoked? 🤔
      if (options?.ignoreEnterTransition) {
        el?.style.removeProperty('position')
        el?.style.removeProperty('visibility')
        return
      }

      setTimeout(() => {
        if (!el) return
        el.style.removeProperty('position')
        el.style.removeProperty('visibility')

        if (inTransitionDuration) {
          if (cachedElementHeight) el.style.setProperty('height', cachedElementHeight + 'px')
        } else {
          const { height } = el.getBoundingClientRect()

          cachedElementHeight = height
          const originalTransitionProps = getComputedStyle(el).transition
          el.style.setProperty('transition', 'none')

          el.clientHeight

          // frequent ui action may cause element havn't attach to DOM yet, when occors, just ignore it.
          el.style.setProperty('height', '0')
          el.clientHeight
          el.style.setProperty('transition', originalTransitionProps)
          /// Force bowser to paint the frame  🤯🤯🤯🤯
          el.style.setProperty('height', height + 'px')
        }
        inTransitionDuration = true
      })
    },
    onAfterEnter({ el }) {
      el?.style.removeProperty('height')
      inTransitionDuration = false
    },
    onBeforeLeave({ el }) {
      if (!el) return
      if (options?.ignoreLeaveTransition) return
      if (inTransitionDuration) {
        el.style.setProperty('height', `0`)
      } else {
        const { height } = el.getBoundingClientRect()
        cachedElementHeight = height

        el.style.setProperty('height', height + 'px')
        // Force bowser to paint the frame  🤯🤯🤯🤯
        el.clientHeight
        el.style.setProperty('height', '0')
      }
      inTransitionDuration = true
    },
    onAfterLeave({ el }) {
      el?.style.removeProperty('height')
      el?.style.setProperty('position', 'absolute')
      el?.style.setProperty('visibility', 'hidden')
      destoryDOMCache()
      inTransitionDuration = false
    },
  })

  function destoryDOMCache() {
    // innerChildren.current = null // clean from internal storage to avoid still render dom
  }

  return {
    plugin: plugin,
    controller,
  }
}

// const cssTransitionPlugin = createPlugin<CSSTransactionOptions, any, any>((options: CSSTransactionOptions = {}) => () => {
//   const { refSetter, transitionProps, isInnerVisiable } = useCSSTransition(options)
//   return {
//     ref: refSetter,
//     ...transitionProps,
//     show: isInnerVisiable,
//   }
// })
