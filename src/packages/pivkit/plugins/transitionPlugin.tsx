import { MayArray, MayFn, flap, shrinkFn } from '@edsolater/fnkit'
import { Accessor, createEffect, createMemo, createSignal, on, onCleanup } from 'solid-js'
import { onEvent } from '../domkit'
import { CSSObject, PivProps, createPlugin, mergeProps } from '../piv'

export type TransitionPhase = 'prepare-to-go' | 'on-going' | 'finish'

export type TransitionController = {
  targetDom: Accessor<HTMLElement | undefined>
  currentPhase: Accessor<TransitionPhase>
}
/**
 * detect by JS, drive by JS
 */
export interface TransitionOptions {
  cssTransitionDurationMs?: number
  cssTransitionTimingFunction?: CSSObject['transitionTimingFunction']

  /** will trigger props:onBeforeEnter() if init props:show  */
  appear?: boolean
  currentIs?: 'from' | 'to'

  /** shortcut for both enterFrom and leaveTo */
  fromProps?: PivProps
  /** shortcut for both enterFrom and leaveTo */
  toProps?: PivProps
  /** normaly don't use this, just from and to is enough */
  progressProps?: PivProps

  onBeforeTransition?: (payload: { from: TransitionPhase; to: TransitionPhase } & TransitionController) => void
  onAfterTransition?: (payload: { from: TransitionPhase; to: TransitionPhase } & TransitionController) => void

  presets?: MayArray<MayFn<Omit<TransitionOptions, 'presets'>>>
}

export const transitionPlugin = createPlugin(
  ({
    cssTransitionDurationMs = 300,
    cssTransitionTimingFunction,

    appear,
    currentIs,

    fromProps,
    toProps,
    /** normaly don't use this */
    progressProps,

    onBeforeTransition,
    onAfterTransition,

    presets,
  }: TransitionOptions = {}) =>
    (props, { dom }) => {
      const transitionPhaseProps = createMemo(() => {
        const baseTransitionICSS = {
          transition: `${cssTransitionDurationMs}ms`,
          transitionTimingFunction: cssTransitionTimingFunction,
        }
        return {
          from: mergeProps(
            flap(presets).map((i) => shrinkFn(i)?.fromProps), // not readable
            progressProps,
            fromProps,
            { style: baseTransitionICSS } as PivProps
          ),
          to: mergeProps(
            flap(presets).map((i) => shrinkFn(i)?.toProps), // not readable
            progressProps,
            toProps,
            { style: baseTransitionICSS } as PivProps
          ),
        } as Record<'from' | 'to', PivProps>
      })

      const [currentPhase, setCurrentPhase] = createSignal<TransitionPhase>(appear ? 'prepare-to-go' : 'finish')

      const controller: TransitionController = {
        targetDom: dom,
        currentPhase,
      }

      // set data-** to element DOM for semantic
      createEffect(() => {
        const el = dom()
        if (el) {
          el.dataset['phase'] = currentPhase()
        }
      })

      // make inTransition during state sync with CSS event
      createEffect(() => {
        const { abort } = onEvent(dom(), 'transitionend', () => setCurrentPhase('finish'), {
          onlyTargetIsSelf: true /* TODO - add feature: attach max one time  */,
        }) // not event fired by bubbled
        onCleanup(abort)
      })

      // invoke callbacks
      createEffect(
        on(currentPhase, (currentPhase, prevPhase = 'finish') => {
          const payload = Object.assign({ from: prevPhase, to: currentPhase }, controller)
          if (prevPhase === 'on-going' && currentPhase === 'finish') {
            dom()?.clientHeight // force GPU render frame
            onAfterTransition?.(payload)
          }

          if (prevPhase === 'finish' && currentPhase === 'prepare-to-go') {
            dom()?.clientHeight // force GPU render frame
            onBeforeTransition?.(payload)
          }
        })
      )

      return createMemo(() => transitionPhaseProps()[currentPhase() === 'prepare-to-go' ? 'from' : 'to'])
    }
)
