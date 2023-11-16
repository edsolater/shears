import { Accessor, createEffect, createSignal, on, Setter } from 'solid-js'
import {
  createTaskAtom,
  CreateTaskAtomOptions,
  TaskAtom,
} from '../taskAtom/taskAtom'
import { asynclyCreateEffect } from './createAsyncEffect'

export function createTaskAtomFromAccessor<T>(accessor: () => T, options?: CreateTaskAtomOptions<T>) {
  const taskAtom = createTaskAtom(accessor(), options)
  asynclyCreateEffect(() => {
    taskAtom.set(accessor())
  })
  return taskAtom
}

/**
 * subscribable to [accessor, setter]
 */
export function useTaskAtom<T>(subscribable: TaskAtom<T>): [Accessor<T>, Setter<T>] {
  const defaultValue = subscribable()
  const [accessor, setter] = createSignal(defaultValue)

  createEffect(
    on(accessor, (v) => {
      subscribable.set(v)
    }),
  )

  return [accessor, setter]
}
