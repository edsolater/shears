import { Accessor, createEffect, createSignal, on, Setter } from 'solid-js'
import {
  createLeaf,
  CreateLeafOptions,
  Leaf,
} from '../smartStore/createLeaf'
import { asynclyCreateEffect } from './createAsyncEffect'

export function createLeafFromAccessor<T>(accessor: () => T, options?: CreateLeafOptions<T>) {
  const leaf = createLeaf(accessor(), options)
  asynclyCreateEffect(() => {
    leaf.set(accessor())
  })
  return leaf
}

/**
 * subscribable to [accessor, setter]
 */
export function useLeaf<T>(subscribable: Leaf<T>): [Accessor<T>, Setter<T>] {
  const defaultValue = subscribable()
  const [accessor, setter] = createSignal(defaultValue)

  createEffect(
    on(accessor, (v) => {
      subscribable.set(v)
    }),
  )

  return [accessor, setter]
}
