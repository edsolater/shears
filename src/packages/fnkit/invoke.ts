import { AnyFn } from '@edsolater/fnkit'

// for readibility
export async function invoke<F extends AnyFn>(fn: F, ...params: Parameters<F>): Promise<ReturnType<F>> {
  return fn(...params)
}

const invokeTime = new Map<AnyFn, Promise<ReturnType<AnyFn>>>()
/** one time, and result will be cached */
export async function invokeOnce<F extends AnyFn>(fn: F, ...params: Parameters<F>): Promise<ReturnType<F>> {
  if (invokeTime.has(fn)) return invokeTime.get(fn) as ReturnType<F>
  const result = fn(...params)
  invokeTime.set(fn, Promise.resolve(result))
  return result
}
