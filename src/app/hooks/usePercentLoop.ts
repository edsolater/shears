import { getNow, setIntervalWithSecondes, shrinkFn, type AnyFn, type MayFn } from "@edsolater/fnkit"
import { createEffect, createMemo, createSignal, on, onCleanup, onMount, type Accessor } from "solid-js"

/**
 * 0 ~ 1
 * mainly for {@link ../components/CircularProgress | CircularProgress}
 * @todo is it possible to use css not js thread?
 */
export function usePercentLoop({
  canRoundCountOverOne,
  onRoundEnd,
  eachSecondPercent = 1 / 10,
  updateEach = 1,
}: {
  updateEach?: number // default 1s
  canRoundCountOverOne?: boolean
  onRoundEnd?: () => void
  eachSecondPercent?: number
} = {}): {
  percent: Accessor<number>
  reset: () => void
} {
  const [percent, setPercent] = createSignal(0) // 0 ~ 1

  const { startLoop, stopLoop } = useLoopTask({
    cb: () => {
      setPercent((percent) => {
        const nextPercent = percent + eachSecondPercent / (updateEach / 1)
        if (nextPercent >= 1) {
          if (canRoundCountOverOne) {
            onRoundEnd?.()
            return 0
          } else {
            return 1
          }
        } else {
          return nextPercent
        }
      })
    },
    delay: updateEach,
  })

  onMount(() => {
    startLoop()
    onCleanup(stopLoop)
  })

  return {
    percent,
    reset() {
      setPercent(0)
    },
  }
}

/**
 * loop task (use setInterval inside)
 */
export function useLoopTask<R>({
  cb,
  delay = 1,
  immediate = true,
}: {
  cb: () => R
  delay?: MayFn<number>
  immediate?: boolean
}): {
  isRunning: Accessor<boolean>
  startLoop(): () => void // return stop action
  stopLoop(): void
  invokeOnce(): R
  lastInvokeTime: Accessor<number>
} {
  const [lastInvokeTime, setLastInvokeTime] = createSignal(0)
  const [isRunning, setIsRunning] = createSignal(false)
  let intervalId: any = null

  function startLoop() {
    clearInterval(intervalId)
    setIsRunning(true)
    intervalId = setIntervalWithSecondes(() => {
      invokeOnce()
    }, shrinkFn(delay))
    if (immediate) {
      invokeOnce()
    }

    return stopLoop
  }

  function stopLoop() {
    setIsRunning(false)
    clearInterval(intervalId)
  }

  function invokeOnce() {
    setLastInvokeTime(getNow())
    return cb?.()
  }

  // restart loop when delay changed
  createEffect(
    on(
      () => shrinkFn(delay),
      () => {
        if (isRunning()) {
          startLoop()
        }
      },
      { defer: true },
    ),
  )

  // stop loop when component unmount
  onCleanup(stopLoop)

  return {
    lastInvokeTime,
    invokeOnce,
    isRunning,
    startLoop,
    stopLoop,
  }
}
