import { createEffect, createSignal, on, onCleanup, type Accessor } from "solid-js"
import { requestLoopAnimationFrame } from "@edsolater/pivkit"
import type { AnyFn } from "@edsolater/fnkit"

/**
 * 0 ~ 1
 * mainly for {@link ../components/CircularProgress | CircularProgress}
 * @todo is it possible to use css not js thread?
 */
export function usePercentLoop({
  canRoundCountOverOne,
  onRoundEnd,
  eachSecondPercent = 1 / 10,
}: {
  canRoundCountOverOne?: boolean
  onRoundEnd?: () => void
  eachSecondPercent?: number
} = {}): {
  /** only changed in 98%-99% not 98.4%-98.5%for example, because it's, meaningless  */
  percent: Accessor<number>
  exactPercent: Accessor<number>
  reset: () => void
} {
  const [exactPercent, setExactPercent] = createSignal(0) // 0 ~ 1
  const percent = useFlattedPercent(exactPercent, { minimum: 0.01 })

  createEffect(() => {
    const { cancel } = requestLoopAnimationFrame(({ pasedTime }) => {
      setExactPercent((percent) => {
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
    exactPercent,
    percent,
    reset() {
      setExactPercent(0)
    },
  }
}

export function useIntervalLoop({
  cb,
  delay = 1000,
  immediate = true,
}: {
  cb?: () => void
  delay?: number
  immediate?: boolean
} = {}): {
  isRunning: Accessor<boolean>
  startLoop(): () => void // return stop action
  stopLoop(): void
  invokeOnce(): void
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
    }, delay)
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
    cb?.()
  }

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

/**
 * only can invoke once
 */
export function oneWayInvoke<F extends AnyFn>(fn: F): F {
  let invoked = false
  let result = null
  return ((...args: Parameters<F>) => {
    if (!invoked) {
      result = fn(...args)
      invoked = true
    }
    return result
  }) as F
}

function useFlattedPercent(percent: Accessor<number>, options?: { /** default 0.001  */ minimum?: number }) {
  const [flattedPercent, setFlattedPercent] = createSignal(percent())
  createEffect(
    on(percent, (currentPercent) => {
      if (Math.abs(currentPercent - flattedPercent()) >= (options?.minimum ?? 0.001)) {
        setFlattedPercent(currentPercent)
      }
    }),
  )
  return flattedPercent
}
