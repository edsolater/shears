import { flap, isFunction, MayArray, MayFn, shrinkFn } from '@edsolater/fnkit'
import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { onEvent } from '../../domkit'
import { mergeProps } from '../../piv'
import { ICSSObject } from '../../piv/propHandlers/icss'
import { createPlugin } from '../../piv/propHandlers/plugin'
import { PivProps } from '../../piv/types/piv'
import { Accessify, useAccessifiedProps } from '../utils/accessifyProps'
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
type TransactionAdditionalProps = Accessify<{
  cssTransitionDurationMs?: number
  cssTransitionTimingFunction?: ICSSObject['transitionTimingFunction']

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

  onBeforeEnter?: (payload: { from: TransitionPhase; to: TransitionPhase; contentRef?: HTMLElement }) => void
  onAfterEnter?: (payload: { from: TransitionPhase; to: TransitionPhase; contentRef?: HTMLElement }) => void
  onBeforeLeave?: (payload: { from: TransitionPhase; to: TransitionPhase; contentRef: HTMLElement }) => void
  onAfterLeave?: (payload: { from: TransitionPhase; to: TransitionPhase; contentRef?: HTMLElement }) => void

  presets?: MayArray<MayFn<Omit<TransactionAdditionalProps, 'presets'>>>
  // children?: ReactNode | ((state: { phase: TransitionPhase }) => ReactNode)
}>

export const useCSSTransition = (additionalProps: TransactionAdditionalProps) => {
  const props = useAccessifiedProps(additionalProps)
  const [contentDivRef, setContentDivRef] = createRef<HTMLElement>()
  const transitionPhaseProps = createMemo(() => {
    const baseTransitionICSS = {
      transition: `${props.cssTransitionDurationMs}ms`,
      transitionTimingFunction: props.cssTransitionTimingFunction
    }
    return {
      enterFrom: mergeProps(
        flap(props.presets).map((i) => shrinkFn(i)?.enterFromProps),
        props.duringEnterProps,
        props.enterFromProps || props.fromProps,
        { style: baseTransitionICSS } as PivProps
      ),
      enterTo: mergeProps(
        flap(props.presets).map((i) => shrinkFn(i)?.enterToProps),
        props.duringEnterProps,
        props.enterToProps || props.toProps,
        { style: baseTransitionICSS } as PivProps
      ),
      leaveFrom: mergeProps(
        flap(props.presets).map((i) => shrinkFn(i)?.leaveFromProps),
        props.duringLeaveProps,
        props.leaveFromProps || props.toProps,
        { style: baseTransitionICSS } as PivProps
      ),
      leaveTo: mergeProps(
        flap(props.presets).map((i) => shrinkFn(i)?.leaveToProps),
        props.duringLeaveProps,
        props.leaveToProps || props.fromProps,
        { style: baseTransitionICSS } as PivProps
      )
    } as Record<TransitionCurrentPhasePropsName, PivProps>
  })
  const [currentPhase, setCurrentPhase] = createSignal<TransitionPhase>(props.show && !props.appear ? 'shown' : 'hidden')
  const targetPhase = () => (props.show ? 'shown' : 'hidden') as TransitionTargetPhase
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
