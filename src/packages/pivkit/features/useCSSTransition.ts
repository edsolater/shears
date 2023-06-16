import { flap, MayArray, MayFn, shrinkFn } from '@edsolater/fnkit'
import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { onEvent } from '../../domkit'
import { mergeProps } from '../../piv'
import { CSSObject } from '../../piv'
import { PivProps } from '../../piv'
import { AccessifyProps, useAccessifiedProps } from '../utils/accessifyProps'
import { createRef } from '../hooks/createRef'
import { Accessify } from '../utils/accessifyProps'

const TransitionPhaseProcessIn = 'during-process'
const TransitionPhaseShowing = 'shown' /* UI visiable and stable(not in transition) */
const TransitionPhaseHidden = 'hidden' /* UI invisiable */

export type TransitionPhase =
  | typeof TransitionPhaseProcessIn
  | typeof TransitionPhaseShowing
  | typeof TransitionPhaseHidden

type TransitionCurrentPhasePropsName = 'enterFrom' | 'enterTo' | 'leaveFrom' | 'leaveTo'
type TransitionTargetPhase = typeof TransitionPhaseShowing | typeof TransitionPhaseHidden
export type UseCSSTransactionOptions = {
  cssTransitionDurationMs?: Accessify<number | undefined, TransitionController>
  cssTransitionTimingFunction?: CSSObject['transitionTimingFunction']

  // detect transition should be turn on
  show?: Accessify<boolean | undefined, TransitionController>
  /** will trigger props:onBeforeEnter() if init props:show  */
  appear?: Accessify<boolean | undefined, TransitionController>

  enterFromProps?: PivProps<any, TransitionController>
  duringEnterProps?: PivProps<any, TransitionController>
  enterToProps?: PivProps<any, TransitionController>

  leaveFromProps?: PivProps<any, TransitionController>
  duringLeaveProps?: PivProps<any, TransitionController>
  leaveToProps?: PivProps<any, TransitionController>

  fromProps?: PivProps<any, TransitionController> // shortcut for both enterFrom and leaveTo
  toProps?: PivProps<any, TransitionController> // shortcut for both enterTo and leaveFrom

  onBeforeEnter?: (payloads: { el: HTMLElement | undefined; from: TransitionPhase; to: TransitionPhase }) => void
  onAfterEnter?: (payloads: { el: HTMLElement | undefined; from: TransitionPhase; to: TransitionPhase }) => void
  onBeforeLeave?: (payloads: { el: HTMLElement | undefined; from: TransitionPhase; to: TransitionPhase }) => void
  onAfterLeave?: (payloads: { el: HTMLElement | undefined; from: TransitionPhase; to: TransitionPhase }) => void

  presets?: MayArray<MayFn<Omit<UseCSSTransactionOptions, 'presets'>>> //🤔 is it plugin? No, pluginHook can't have plugin prop
  // children?: ReactNode | ((state: { phase: TransitionPhase }) => ReactNode)
}
interface TransitionController {
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
    },
  }
  const opts = useAccessifiedProps(additionalOpts, controller)
  const [contentDivRef, setContentDivRef] = createRef<HTMLElement>()
  const transitionPhaseProps = createMemo(() => {
    const baseTransitionICSS = {
      transition: `${opts.cssTransitionDurationMs ?? 250}ms`,
      transitionTimingFunction: opts.cssTransitionTimingFunction,
    }
    const presets = flap(opts.presets)
    return {
      enterFrom: mergeProps(
        presets.map((i) => shrinkFn(i)?.enterFromProps),
        opts.duringEnterProps,
        opts.enterFromProps || opts.fromProps,
        { style: baseTransitionICSS } as PivProps,
      ),
      enterTo: mergeProps(
        presets.map((i) => shrinkFn(i)?.enterToProps),
        opts.duringEnterProps,
        opts.enterToProps || opts.toProps,
        { style: baseTransitionICSS } as PivProps,
      ),
      leaveFrom: mergeProps(
        presets.map((i) => shrinkFn(i)?.leaveFromProps),
        opts.duringLeaveProps,
        opts.leaveFromProps || opts.toProps,
        { style: baseTransitionICSS } as PivProps,
      ),
      leaveTo: mergeProps(
        presets.map((i) => shrinkFn(i)?.leaveToProps),
        opts.duringLeaveProps,
        opts.leaveToProps || opts.fromProps,
        { style: baseTransitionICSS } as PivProps,
      ),
    } as Record<TransitionCurrentPhasePropsName, PivProps>
  })
  const [currentPhase, setCurrentPhase] = createSignal<TransitionPhase>(opts.show && !opts.appear ? 'shown' : 'hidden')
  const targetPhase = () => (opts.show ? 'shown' : 'hidden') as TransitionTargetPhase
  const isInnerVisiable = createMemo(
    () => currentPhase() === 'during-process' || currentPhase() === 'shown' || targetPhase() === 'shown',
  )
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
      onlyTargetIsSelf: true, // not event fired by bubbled
    })
    onCleanup(() => subscription.abort())
  })

  // change current phase by target phase
  createEffect(() => {
    if (targetPhase() !== currentPhase() && currentPhase() !== 'during-process') {
      setCurrentPhase('during-process')
    }
  })

  // invoke callbacks
  createEffect((prevCurrentPhase: TransitionPhase | void) => {
    const el = contentDivRef()

    if (currentPhase() === 'shown' && targetPhase() === 'shown') {
      contentDivRef()?.clientHeight // force GPU render frame
      opts.onAfterEnter?.({ el, from: 'shown', to: 'shown' })
    }

    if (currentPhase() === 'hidden' && targetPhase() === 'hidden') {
      contentDivRef()?.clientHeight // force GPU render frame
      opts.onAfterLeave?.({ el, from: 'hidden', to: 'hidden' })
    }

    if (
      (currentPhase() === 'hidden' || (currentPhase() === 'during-process' && prevCurrentPhase === 'during-process')) &&
      targetPhase() === 'shown'
    ) {
      contentDivRef()?.clientHeight // force GPU render frame
      opts.onBeforeEnter?.({ el, to: 'shown', from: currentPhase() })
    }

    if (
      (currentPhase() === 'shown' || (currentPhase() === 'during-process' && prevCurrentPhase === 'during-process')) &&
      targetPhase() === 'hidden'
    ) {
      contentDivRef()?.clientHeight // force GPU render frame
      opts.onBeforeLeave?.({ el, to: 'hidden', from: currentPhase() })
    }
  }, currentPhase())

  const transitionProps = () => transitionPhaseProps()[currentPhasePropsName()]

  return { /** must set */ refSetter: setContentDivRef, /** must set */ transitionProps, isInnerVisiable }
}
