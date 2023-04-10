import { flap, MayArray, MayFn, shrinkFn } from '@edsolater/fnkit'
import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { onEvent } from '../../domkit'
import { mergeProps } from '../../piv'
import { CSSObject } from '../../piv/propHandlers/icss'
import { PivProps } from '../../piv/types/piv'
import { Accessify, useAccessifiedProps } from '../utils/accessifyProps'
import { createRef } from '../hooks/createRef'

const TransitionPhaseProcessIn = 'during-process'
const TransitionPhaseShowing = 'shown' /* UI visiable and stable(not in transition) */
const TransitionPhaseHidden = 'hidden' /* UI invisiable */

export type TransitionPhase =
  | typeof TransitionPhaseProcessIn
  | typeof TransitionPhaseShowing
  | typeof TransitionPhaseHidden

type TransitionCurrentPhasePropsName = 'enterFrom' | 'enterTo' | 'leaveFrom' | 'leaveTo'
type TransitionTargetPhase = typeof TransitionPhaseShowing | typeof TransitionPhaseHidden
export type UseCSSTransactionOptions = Accessify<
  {
    cssTransitionDurationMs?: number
    cssTransitionTimingFunction?: CSSObject['transitionTimingFunction']

    // detect transition should be turn on
    show?: boolean
    /** will trigger props:onBeforeEnter() if init props:show  */
    appear?: boolean

    enterFromProps?: PivProps
    duringEnterProps?: PivProps
    enterToProps?: PivProps

    leaveFromProps?: PivProps
    duringLeaveProps?: PivProps
    leaveToProps?: PivProps

    fromProps?: PivProps // shortcut for both enterFrom and leaveTo
    toProps?: PivProps // shortcut for both enterTo and leaveFrom

    onBeforeEnter?: () => void
    onAfterEnter?: () => void
    onBeforeLeave?: () => void
    onAfterLeave?: () => void

    presets?: MayArray<MayFn<Omit<UseCSSTransactionOptions, 'presets'>>> //🤔 is it plugin? No, pluginHook can't have plugin prop
    // children?: ReactNode | ((state: { phase: TransitionPhase }) => ReactNode)
  },
  TransitionController
>
type TransitionController = {
  contentRef?: HTMLElement
  from: TransitionPhase
  to: TransitionPhase
}

export const useCSSTransition = (additionalOpts: UseCSSTransactionOptions) => {
  const controller: TransitionController = {
    get from() {
      return currentPhase()
    },
    get to() {
      return targetPhase()
    },
    get contentRef() {
      return contentDivRef()
    }
  }
  const opts = useAccessifiedProps(additionalOpts, controller)
  const [contentDivRef, setContentDivRef] = createRef<HTMLElement>()
  const transitionPhaseProps = createMemo(() => {
    const baseTransitionICSS = {
      transition: `${opts.cssTransitionDurationMs ?? 250}ms`,
      transitionTimingFunction: opts.cssTransitionTimingFunction
    }
    const presets = flap(opts.presets)
    return {
      enterFrom: mergeProps(
        presets.map((i) => shrinkFn(i)?.enterFromProps),
        opts.duringEnterProps,
        opts.enterFromProps || opts.fromProps,
        { style: baseTransitionICSS } as PivProps
      ),
      enterTo: mergeProps(
        presets.map((i) => shrinkFn(i)?.enterToProps),
        opts.duringEnterProps,
        opts.enterToProps || opts.toProps,
        { style: baseTransitionICSS } as PivProps
      ),
      leaveFrom: mergeProps(
        presets.map((i) => shrinkFn(i)?.leaveFromProps),
        opts.duringLeaveProps,
        opts.leaveFromProps || opts.toProps,
        { style: baseTransitionICSS } as PivProps
      ),
      leaveTo: mergeProps(
        presets.map((i) => shrinkFn(i)?.leaveToProps),
        opts.duringLeaveProps,
        opts.leaveToProps || opts.fromProps,
        { style: baseTransitionICSS } as PivProps
      )
    } as Record<TransitionCurrentPhasePropsName, PivProps>
  })
  const [currentPhase, setCurrentPhase] = createSignal<TransitionPhase>(opts.show && !opts.appear ? 'shown' : 'hidden')
  const targetPhase = () => (opts.show ? 'shown' : 'hidden') as TransitionTargetPhase
  const isInnerVisiable = createMemo(
    () => currentPhase() === 'during-process' || currentPhase() === 'shown' || targetPhase() === 'shown'
  )
  const currentPhasePropsName = createMemo<TransitionCurrentPhasePropsName>(() =>
    targetPhase() === 'shown'
      ? currentPhase() === 'hidden'
        ? 'enterFrom'
        : 'enterTo'
      : currentPhase() === 'shown'
      ? 'leaveFrom'
      : 'leaveTo'
  )

  // set data-** to element for semantic
  createEffect(() => {
    const el = contentDivRef()
    if (el) {
      el.dataset['from'] = currentPhase()
      el.dataset['to'] = targetPhase()
    }
  })

  // make inTransition during state sync with UI event
  // const hasSetOnChangeCallback = useRef(false)
  createEffect(() => {
    const el = contentDivRef()
    if (!el) return
    const subscription = onEvent(el, 'transitionend', () => setCurrentPhase(targetPhase()), {
      onlyTargetIsSelf: true // not event fired by bubbled
    })
    onCleanup(() => subscription.cancel())
  })

  // change current phase by target phase
  createEffect(() => {
    if (targetPhase() !== currentPhase() && currentPhase() !== 'during-process') {
      setCurrentPhase('during-process')
    }
  })

  // invoke callbacks
  createEffect((prevCurrentPhase) => {
    if (currentPhase() === 'shown' && targetPhase() === 'shown') {
      contentDivRef()?.clientHeight // force GPU render frame
      opts.onAfterEnter?.()
    }

    if (currentPhase() === 'hidden' && targetPhase() === 'hidden') {
      contentDivRef()?.clientHeight // force GPU render frame
      opts.onAfterLeave?.()
    }

    if (
      (currentPhase() === 'hidden' || (currentPhase() === 'during-process' && prevCurrentPhase === 'during-process')) &&
      targetPhase() === 'shown'
    ) {
      contentDivRef()?.clientHeight // force GPU render frame
      opts.onBeforeEnter?.()
    }

    if (
      (currentPhase() === 'shown' || (currentPhase() === 'during-process' && prevCurrentPhase === 'during-process')) &&
      targetPhase() === 'hidden'
    ) {
      contentDivRef()?.clientHeight // force GPU render frame
      opts.onBeforeLeave?.()
    }
  }, currentPhase())

  const transitionProps = () => transitionPhaseProps()[currentPhasePropsName()]

  return { /** must set */ refSetter: setContentDivRef, /** must set */ transitionProps, isInnerVisiable }
}
