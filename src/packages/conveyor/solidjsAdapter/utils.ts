import { Accessor, createEffect, createSignal, on, Setter } from 'solid-js'
import {
  createShuck,
  CreateShuckOptions,
  Shuck,
} from '../smartStore/shuck'
import { asynclyCreateEffect } from './createAsyncEffect'

export function createLeafFromAccessor<T>(accessor: () => T, options?: CreateShuckOptions<T>) {
  const leaf = createShuck(accessor(), options)
  asynclyCreateEffect(() => {
    leaf.set(accessor())
  })
  return leaf
}

/**
 * subscribable to [accessor, setter]
 */
export function useLeaf<T>(subscribable: Shuck<T>): [Accessor<T>, Setter<T>] {
  const defaultValue = subscribable()
  const [accessor, setter] = createSignal(defaultValue)

  createEffect(
    on(accessor, (v) => {
      subscribable.set(v)
    }),
  )

  return [accessor, setter]
}
