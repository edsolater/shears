import { createCurrentTimestamp } from '@edsolater/fnkit'

const defaultDebouneDelay = 400
const defaultThrottleDelay = 400

export type DebounceOptions = {
  delay?: number
}
export type ThrottleOptions = {
  delay?: number
}

/**
 *
 * @requires {@link createCurrentTimestamp `createCurrentTimestamp()`}
 */
export function debounce<F extends (...args: any[]) => any>(fn: F, options?: DebounceOptions): F {
  let lastInvokedTimestamp = 0
  const { delay = defaultDebouneDelay } = options ?? {}
  let cachedFnResult: ReturnType<F> | undefined = undefined
  //@ts-ignore
  return (...args) => {
    const currentTimestamp = createCurrentTimestamp()
    if (currentTimestamp - lastInvokedTimestamp > delay) {
      lastInvokedTimestamp = currentTimestamp
      const result = fn(...args)
      cachedFnResult = result
    }
    return cachedFnResult
  }
}

/**
 *
 * @requires {@link createCurrentTimestamp `createCurrentTimestamp()`}
 * @todo throttle should return result
 */
export function throttle<F extends (...args: any[]) => any>(fn: F, options?: ThrottleOptions): F {
  const middleParams = [] as Parameters<F>[]
  let currentTimoutId: any | null = null
  let prevDurationTimestamp: number | null = null
  let remainDelayTime = options?.delay ?? defaultThrottleDelay
  let cachedFnResult: ReturnType<F> | undefined = undefined

  const invokeFn = () => {
    const result = fn(...middleParams[middleParams.length - 1])
    middleParams.length = 0 // clear middleParams
    currentTimoutId = null // clear Timeout Id
    remainDelayTime = options?.delay ?? defaultThrottleDelay // reset remain time
    cachedFnResult = result
    return result
  }
  // @ts-expect-error force
  return (...args: Parameters<F>) => {
    middleParams.push(args)

    const currentTimestamp = createCurrentTimestamp()

    if (currentTimoutId) {
      clearTimeout(currentTimoutId)
      remainDelayTime -= prevDurationTimestamp ? currentTimestamp - prevDurationTimestamp : 0
    }

    if (remainDelayTime <= 0) {
      invokeFn()
    } else {
      currentTimoutId = setTimeout(invokeFn, remainDelayTime)
    }

    prevDurationTimestamp = currentTimestamp
  }
}
