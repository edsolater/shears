import { createEffect, createSignal, onCleanup } from "solid-js"
import { requestLoopAnimationFrame } from "@edsolater/pivkit"

/**
 * 0 ~ 1
 * mainly for {@link ../components/CircularProgress | CircularProgress}
 * @todo is it possible to use css not js thread?
 */
export function useLoop({
  canRoundCountOverOne,
  onRoundEnd,
  eachSecondPercent = 1 / 10,
}: {
  canRoundCountOverOne?: boolean
  onRoundEnd?: () => void
  eachSecondPercent?: number
} = {}) {
  const [percent, setPercent] = createSignal(0) // 0 ~ 1

  createEffect(() => {
    const { cancel } = requestLoopAnimationFrame(({ pasedTime }) => {
      setPercent((percent) => {
        if (pasedTime == null) return 0

        if (canRoundCountOverOne) {
          const newPercent = percent + eachSecondPercent * (pasedTime / 1000)
          if (Math.floor(newPercent) !== Math.floor(percent)) {
            onRoundEnd?.()
            return newPercent
          } else {
            return newPercent
          }
        } else {
          const newPercent = percent + eachSecondPercent * (pasedTime / 1000)
          if (newPercent >= 1) {
            onRoundEnd?.()
            return 0
          } else {
            return newPercent
          }
        }
      })
    })
    onCleanup(cancel)
  })

  return {
    percent,
    reset() {
      setPercent(0)
    },
  }
}
