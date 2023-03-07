import { AnyFn } from '@edsolater/fnkit'

// for readibility
export async function invoke<F extends AnyFn>(fn: F, ...params: Parameters<F>): Promise<ReturnType<F>> {
  return fn(...params)
}
