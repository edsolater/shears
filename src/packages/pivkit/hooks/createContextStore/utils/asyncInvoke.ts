import { AnyFn } from '@edsolater/fnkit'

const queueTask = new Map<string | number | symbol, AnyFn>()

export function asyncInvoke<T>(
  fn: () => T,
  options?: {
    /** same key tasks will only invoke once in one event loop */
    key?: string | number | symbol
  },
): Promise<T> {
  const key = options?.key
  if (key) {
    queueTask.set(key, fn)
    return Promise.resolve().then(() => {
      const cb = queueTask.get(key)
      queueTask.delete(key)
      return cb?.()
    })
  } else {
    return Promise.resolve().then(fn)
  }
}
