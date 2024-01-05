import { MayFn, MayPromise, shrinkFn } from '@edsolater/fnkit'
import { Accessor, createSignal } from 'solid-js'

export function createAsyncMemo<V, F = never>(
  asyncGetValue: () => MayPromise<V>,
  fallbackValue?: MayFn<F>,
): Accessor<F extends never ? V : V | F> {
  const [accessor, setter] = createSignal(shrinkFn(fallbackValue))
  Promise.resolve(asyncGetValue()).then((v) => setter(v as any))
  return accessor as any
}

type T = never | string
