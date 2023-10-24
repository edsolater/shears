import { AnyFn, createCurrentTimestamp } from '@edsolater/fnkit'

const defaultDebouneDelay = 400
const defaultThrottleDelay = 400

export interface DebounceOptions {
  /** @default true */
  alwaysCalculateInFirstInvoke?: boolean
  /** @default 400 */
  delay?: number
}

export interface ThrottleOptions {
  /** @default 400 */
  delay?: number
}

/**
 * a period will only invoke fist task
 * @see https://juejin.cn/post/6971431743681200165
 */
export function debounce<F extends (...args: any[]) => any>(fn: F, options?: DebounceOptions): PromisifyFunction<F> {
  let returnValueResolve: AnyFn | undefined = undefined
  const { delay = defaultDebouneDelay, alwaysCalculateInFirstInvoke = true } = options ?? {}
  let lastInvokedTimestamp = alwaysCalculateInFirstInvoke ? 0 : createCurrentTimestamp()
  let cachedFnResult = new Promise((resolve, reject) => {
    returnValueResolve = resolve
  })
  //@ts-ignore
  return (...args) => {
    const currentTimestamp = createCurrentTimestamp()
    if (currentTimestamp - lastInvokedTimestamp > delay) {
      lastInvokedTimestamp = currentTimestamp
      const result = fn(...args)
      returnValueResolve?.(result)
    }
    return cachedFnResult
  }
}
function debounce2(fn, delay) {
  let timerId: NodeJS.Timeout | number
  let returnValueResolve: AnyFn

  let lastInvokedTimestamp: number | undefined

  let debouncedResult = new Promise((resolve, reject) => {
    returnValueResolve = resolve
  })

  function debounced() {
    // clear last
    globalThis.clearTimeout(timerId)
    
    timerId = globalThis.setTimeout(() => {
      // create new promise if needed
      returnValueResolve(fn())
    }, delay)
    return debouncedResult
  }

  return debounced
}

/**
 * will only invoke once (at last frame) in one period
 * @see https://juejin.cn/post/6971431743681200165
 */
export function throttle<F extends (...args: any[]) => any>(fn: F, options?: ThrottleOptions): F {
  const middleParams = [] as Parameters<F>[]
  let currentTimoutId: any | null = null
  let prevDurationTimestamp: number | null = null
  let remainDelayTime = options?.delay ?? defaultThrottleDelay
  let cachedFnResult: ReturnType<F> | undefined = undefined

  const invokeFn = () => {
    const result = fn(...(middleParams.at(-1) ?? []))
    middleParams.length = 0 // clear middleParams
    currentTimoutId = null // clear Timeout Id
    remainDelayTime = options?.delay ?? defaultThrottleDelay // reset remain time
    cachedFnResult = result
    return result
  }
  // @ts-expect-error force
  return function throttled(...args: Parameters<F>) {
    middleParams.push(args)

    const currentTimestamp = createCurrentTimestamp()

    if (currentTimoutId) {
      globalThis.clearTimeout(currentTimoutId)
      remainDelayTime -= prevDurationTimestamp ? currentTimestamp - prevDurationTimestamp : 0
    }

    if (remainDelayTime <= 0) {
      invokeFn()
    } else {
      currentTimoutId = globalThis.setTimeout(invokeFn, remainDelayTime)
    }

    prevDurationTimestamp = currentTimestamp
  }
}

function promisedSetTimeout<T>(
  fn: () => T | Promise<T>,
  delay: number,
): { timer: Promise<ReturnType<typeof setTimeout>>; result: Promise<Awaited<T>> } {
  let timerPromiseResolve: (value: ReturnType<typeof setTimeout>) => void
  const timer = new Promise<ReturnType<typeof setTimeout>>((resolve, reject) => {
    timerPromiseResolve = resolve
  })
  const result = new Promise<Awaited<T>>((resolve, reject) => {
    const id = globalThis.setTimeout(async () => {
      try {
        const result = await fn()
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }, delay)
    timerPromiseResolve(id)
  })
  return { timer, result }
}

type PromisifyFunction<F extends (...args: any[]) => any> = (...args: Parameters<F>) => Promise<Awaited<ReturnType<F>>>

function promisifyFunctionResult<F extends AnyFn>(fn: F): PromisifyFunction<F> {
  return async (...args) => {
    const result = fn(...args)
    if (result instanceof Promise) {
      return result
    } else {
      return Promise.resolve(result)
    }
  }
}
