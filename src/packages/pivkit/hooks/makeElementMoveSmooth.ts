import { Accessor, AccessorArray, createEffect, on, onCleanup } from 'solid-js'
import { createRef } from './createRef'

/**
 * Animates an element's movement when its position changes.
 * @param options - The options for the animation.
 * @param options.animateOptions - The options for the animation, such as duration and easing.
 * @param options.observeOn - The accessor or accessor array to observe for changes in position.
 * @returns An object with a `setRef` function to set the element reference.
 */
export function makeElementMoveSmooth(options: {
  animateOptions?: KeyframeEffectOptions
  observeOn: Accessor<any> | AccessorArray<any>
}) {
  const animateOptions = { duration: 160, easing: 'ease-in-out', ...options?.animateOptions  }

  const [squareRef, setSquareRef] = createRef<HTMLElement>()

  let fromRectPositon: DOMRect | undefined = undefined

  // position change
  createEffect(
    on(options.observeOn, () => {
      const el = squareRef()
      if (!el) return
      const toRect = el.getBoundingClientRect()
      let animationControl: Animation | undefined
      if (fromRectPositon && toRect && hasPositionChanged(fromRectPositon, toRect)) {
        const deltaX = toRect.x - fromRectPositon.x
        const deltaY = toRect.y - fromRectPositon.y
        animationControl = el.animate(
          [{ transform: `translate(${-deltaX}px, ${-deltaY}px)` }, { transform: '', offset: 1 }],
          animateOptions // iteration 1 can use to moke transition
        )
      }

      onCleanup(() => {
        if (!animationControl || animationControl.playState === 'finished') {
          // record for next frame
          fromRectPositon = toRect
        } else {
          // record for next frame
          fromRectPositon = el.getBoundingClientRect()
          animationControl?.cancel()
        }
      })
    })
  )

  return { setMotionTargetRef: setSquareRef }
}

/**
 * check whether position has changed
 *
 * @param from old element position
 * @param to new element position
 * @returns whether position has changed
 */
function hasPositionChanged(from: DOMRect, to: DOMRect) {
  return from.x !== to.x || from.y !== to.y
}
