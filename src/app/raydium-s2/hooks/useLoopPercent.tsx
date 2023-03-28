import { createEffect, createSignal, onCleanup } from 'solid-js'
import { requestLoopAnimationFrame } from '../../../packages/domkit/requestLoopAnimationFrame'
import { CircularProgress } from '../components/CircularProgress'

/**
 * 0 ~ 1
 * mainly for {@link CircularProgress}
 * @todo is it possible to use css not js thread?
 */
export function useLoopPercent() {
  const [percent, setPercent] = createSignal(0)

  const onEnd = () => {
    // console.log('onEnd')
  }
  createEffect(() => {
    const { cancel } = requestLoopAnimationFrame(() => {
      setPercent((percent) => {
        if (percent >= 1) {
          onEnd()
          return 0
        }
        return percent + (1 / 100 / 60) * 20 /** the bigger the faster */
      })
    })
    onCleanup(cancel)
  })

  return { percent }
}
