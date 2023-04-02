import { flap, isFunction, MayArray, MayFn, shrinkFn } from '@edsolater/fnkit'
import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { onEvent } from '../../domkit'
import { mergeProps } from '../../piv'
import { ICSSObject } from '../../piv/propHandlers/icss'
import { createPlugin } from '../../piv/propHandlers/plugin'
import { PivProps } from '../../piv/types/piv'
import { createRef } from './createRef'

const TransitionPhaseProcessIn = 'during-process'
const TransitionPhaseShowing = 'shown' /* UI visiable and stable(not in transition) */
const TransitionPhaseHidden = 'hidden' /* UI invisiable */

export type TransitionPhase =
  | typeof TransitionPhaseProcessIn
  | typeof TransitionPhaseShowing
  | typeof TransitionPhaseHidden

type TransitionCurrentPhasePropsName = 'enterFrom' | 'enterTo' | 'leaveFrom' | 'leaveTo'
type TransitionTargetPhase = typeof TransitionPhaseShowing | typeof TransitionPhaseHidden
type TransactionAdditionalOptions = {
  cssTransitionDurationMs?: number
  cssTransitionTimingFunction?: ICSSObject['transitionTimingFunction']

  // detect transition should be turn on
  show?: boolean | (() => boolean)
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

  onBeforeEnter?: (payload: { from: TransitionPhase; to: TransitionPhase; contentRef?: HTMLElement }) => void
  onAfterEnter?: (payload: { from: TransitionPhase; to: TransitionPhase; contentRef?: HTMLElement }) => void
  onBeforeLeave?: (payload: { from: TransitionPhase; to: TransitionPhase; contentRef: HTMLElement }) => void
  onAfterLeave?: (payload: { from: TransitionPhase; to: TransitionPhase; contentRef?: HTMLElement }) => void

  presets?: MayArray<MayFn<Omit<TransactionAdditionalOptions, 'presets'>>>
  // children?: ReactNode | ((state: { phase: TransitionPhase }) => ReactNode)
}

export const useCSSTransition = (opts: TransactionAdditionalOptions) => {
  const [contentDivRef, setContentDivRef] = createRef<HTMLElement>()
  const show = createMemo(() => (isFunction(opts.show) ? opts.show() : !!opts.show))
  const transitionPhaseProps = createMemo(() => {
    const baseTransitionICSS = {
      transition: `${opts.cssTransitionDurationMs}ms`,
      transitionTimingFunction: opts.cssTransitionTimingFunction
    }
    return {
      enterFrom: mergeProps(
        flap(opts.presets).map((i) => shrinkFn(i)?.enterFromProps),
        opts.duringEnterProps,
        opts.enterFromProps || opts.fromProps,
        { style: baseTransitionICSS } as PivProps
      ),
      enterTo: mergeProps(
        flap(opts.presets).map((i) => shrinkFn(i)?.enterToProps),
        opts.duringEnterProps,
        opts.enterToProps || opts.toProps,
        { style: baseTransitionICSS } as PivProps
      ),
      leaveFrom: mergeProps(
        flap(opts.presets).map((i) => shrinkFn(i)?.leaveFromProps),
        opts.duringLeaveProps,
        opts.leaveFromProps || opts.toProps,
        { style: baseTransitionICSS } as PivProps
      ),
      leaveTo: mergeProps(
        flap(opts.presets).map((i) => shrinkFn(i)?.leaveToProps),
        opts.duringLeaveProps,
        opts.leaveToProps || opts.fromProps,
        { style: baseTransitionICSS } as PivProps
      )
    } as Record<TransitionCurrentPhasePropsName, PivProps>
  })
  const [currentPhase, setCurrentPhase] = createSignal<TransitionPhase>(show() && !opts.appear ? 'shown' : 'hidden')
  const targetPhase = () => (show() ? 'shown' : 'hidden') as TransitionTargetPhase
  const isInnerShow = createMemo(
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

  const transitionProps = () => transitionPhaseProps()[currentPhasePropsName()]

  return { refSetter: setContentDivRef, transitionProps }
}
