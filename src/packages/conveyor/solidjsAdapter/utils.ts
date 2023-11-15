import { Accessor, createEffect, createSignal, on, Setter } from 'solid-js'
import {
  createTaskSubscribable,
  CreateTaskSubscribableOptions,
  TaskSubscribable,
} from '../subscribable/taskSubscribable'
import { asynclyCreateEffect } from './createAsyncEffect'

export function createTaskSubscribableFromAccessor<T>(accessor: () => T, options?: CreateTaskSubscribableOptions<T>) {
  const taskSubscribable = createTaskSubscribable(accessor(), options)
  asynclyCreateEffect(() => {
    taskSubscribable.set(accessor())
  })
  return taskSubscribable
}

/**
 * subscribable to [accessor, setter]
 */
export function useTaskSubscribable<T>(subscribable: TaskSubscribable<T>): [Accessor<T>, Setter<T>] {
  const defaultValue = subscribable()
  const [accessor, setter] = createSignal(defaultValue)

  createEffect(
    on(accessor, (v) => {
      subscribable.set(v)
    }),
  )

  return [accessor, setter]
}
