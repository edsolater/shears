import { shrinkFn, type AnyFn, type MayFn } from "@edsolater/fnkit"
import { createEffect, createSignal, on, onCleanup, onMount, type Accessor } from "solid-js"

/**
 * 0 ~ 1
 * mainly for {@link ../components/CircularProgress | CircularProgress}
 * @todo is it possible to use css not js thread?
 */
export function usePercentLoop({
  canRoundCountOverOne,
  onRoundEnd,
  eachSecondPercent = 1 / 10,
  updateEach = 1000,
}: {
  updateEach?: number // default 1000ms
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
        const nextPercent = percent + eachSecondPercent / (updateEach / 1000)
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
  delay = 1000,
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
    if (isRunning()) return () => {}
    setIsRunning(true)
    intervalId = setInterval(() => {
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
    setLastInvokeTime(Date.now())
    return cb?.()
  }

  // restart loop when delay changed
  createEffect(
    on(
      () => shrinkFn(delay),
      () => {
        if (isRunning()) {
          stopLoop()
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
