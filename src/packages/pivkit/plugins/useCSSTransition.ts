import { flap, MayArray, MayFn, shrinkFn } from '@edsolater/fnkit'
import { Accessor, createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { addEventListener } from '../domkit'
import { createRef } from '../hooks/createRef'
import { createPlugin, CSSObject, mergeProps, PivProps } from '../piv'
import { Accessify, useAccessifiedProps } from '../utils/accessifyProps'
import { createController } from '../utils/createController'
import { runtimeObject } from '../../fnkit/runtimeObject'

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
  fromProps?: PivProps<any, TransitionController> // shortcut for both enterFrom and leaveTo
  /** enterTo + leaveFrom */
  toProps?: PivProps<any, TransitionController> // shortcut for both enterTo and leaveFrom

  onBeforeEnter?: (payloads: { el: HTMLElement | undefined; from: TransitionPhase; to: TransitionPhase }) => void
  onAfterEnter?: (payloads: { el: HTMLElement | undefined; from: TransitionPhase; to: TransitionPhase }) => void
  onBeforeLeave?: (payloads: { el: HTMLElement | undefined; from: TransitionPhase; to: TransitionPhase }) => void
  onAfterLeave?: (payloads: { el: HTMLElement | undefined; from: TransitionPhase; to: TransitionPhase }) => void

  presets?: MayArray<MayFn<Omit<CSSTransactionOptions, 'presets'>>> //🤔 is it plugin? No, pluginHook can't have plugin prop
  // children?: ReactNode | ((state: { phase: TransitionPhase }) => ReactNode)
}

interface TransitionController {
  contentDom: Accessor<HTMLElement | undefined>
  from: Accessor<TransitionPhase>
  to: Accessor<TransitionPhase>
}

export const useCSSTransition = (additionalOpts: CSSTransactionOptions = {}) => {
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
        opts.enterFromProps || opts.fromProps,
        { style: basic },
      ) as PivProps,
      enterTo: mergeProps(
        presets.map((i) => shrinkFn(i)?.enterToProps),
        opts.enterProps,
        opts.enterToProps || opts.toProps,
        { style: basic },
      ) as PivProps,
      leaveFrom: mergeProps(
        presets.map((i) => shrinkFn(i)?.leaveFromProps),
        opts.leaveProps,
        opts.leaveFromProps || opts.toProps,
        { style: basic },
      ) as PivProps,
      leaveTo: mergeProps(
        presets.map((i) => shrinkFn(i)?.leaveToProps),
        opts.leaveProps,
        opts.leaveToProps || opts.fromProps,
        { style: basic },
      ) as PivProps,
    } as Record<TransitionCurrentPhasePropsName, PivProps>
  })

  const [currentPhase, setCurrentPhase] = createSignal<TransitionPhase>(opts.show && !opts.appear ? 'shown' : 'hidden')
  const targetPhase = createMemo(() => (opts.show ? 'shown' : 'hidden'))
  const isInnerVisiable = createMemo(
    () => currentPhase() === 'during-process' || currentPhase() === 'shown' || targetPhase() === 'shown',
  )
  createEffect(() => {
    console.log('currentPhase: ', currentPhase())
  })
  createEffect(() => {
    console.log('targetPhase: ', targetPhase())
  })
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
    const subscription = addEventListener(el, 'transitionend', () => setCurrentPhase(targetPhase()), {
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
    const el = contentDom()

    if (currentPhase() === 'shown' && targetPhase() === 'shown') {
      contentDom()?.clientHeight // force GPU render frame
      opts.onAfterEnter?.({ el, from: 'shown', to: 'shown' })
    }

    if (currentPhase() === 'hidden' && targetPhase() === 'hidden') {
      contentDom()?.clientHeight // force GPU render frame
      opts.onAfterLeave?.({ el, from: 'hidden', to: 'hidden' })
    }

    if (
      (currentPhase() === 'hidden' || (currentPhase() === 'during-process' && prevCurrentPhase === 'during-process')) &&
      targetPhase() === 'shown'
    ) {
      contentDom()?.clientHeight // force GPU render frame
      opts.onBeforeEnter?.({ el, to: 'shown', from: currentPhase() })
    }

    if (
      (currentPhase() === 'shown' || (currentPhase() === 'during-process' && prevCurrentPhase === 'during-process')) &&
      targetPhase() === 'hidden'
    ) {
      contentDom()?.clientHeight // force GPU render frame
      opts.onBeforeLeave?.({ el, to: 'hidden', from: currentPhase() })
    }
  }, currentPhase())

  const transitionProps = () => {
    const mergeProps = transitionPhaseProps()[currentPhasePropsName()]
    return mergeProps
  }

  return { refSetter: setContentDom, transitionProps, isInnerVisiable }
}

// TODO: why not work?
export function createTransitionPlugin(options?: Omit<CSSTransactionOptions, 'show'>) {
  const [show, setShow] = createSignal(false)

  function toggle() {
    setShow((b) => !b)
  }
  const pluginController = {
    toggle,
  }

  const { refSetter, transitionProps } = useCSSTransition({
    show,
    ...options,
  })
  console.log('transitionProps(): ', transitionProps())

  return {
    plugin: createPlugin(
      () => () => // does must use a high function ?
        runtimeObject<PivProps>({
          // if not use runtimeObject, the props will be consumed too early
          shadowProps: () => transitionProps(),
          domRef: () => refSetter,
        }),
    ),
    transitionProps,
    domRef: refSetter,
    pluginController,
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
