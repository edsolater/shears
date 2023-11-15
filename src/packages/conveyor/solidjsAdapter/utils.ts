import { createEffect } from 'solid-js'
import { createTaskSubscribable } from '../subscribable/taskSubscribable'

function createTaskSubscribableFromAccessor<T>(accessor: () => T, {}) {
  const taskSubscribable = createTaskSubscribable(accessor())
  createEffect(() => {
    taskSubscribable.set(accessor())
  })
  return taskSubscribable
}
