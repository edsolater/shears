import { MayFn, WeakerSet } from '@edsolater/fnkit'
import { observe } from '../../fnkit/observe'
import { Subscribable, createSubscribable, isSubscribable } from './core'
import { TaskExecutor, invokeExecutor } from './createTask'

export const TaskSubscribableTag = Symbol('observableSubscribable')
/**
 * add ability to pure subscribable
 */
export interface TaskSubscribable<T> extends Subscribable<T> {
  /**
   * used by TaskExecutor to track subscribable's visiability
   *
   * only effect exector will auto run if it's any observed TaskSubscribable is visiable \
   * visiable, so effect is meaningful for user
   */
  visiable: Subscribable<boolean>
  // when set this, means this object is a observable-subscribable
  [TaskSubscribableTag]: boolean
  subscribedExecutors: WeakerSet<TaskExecutor>
}
interface CreateTaskSubscribableOptions<T> {
  visiable?: boolean
  onAccessed?: (currentValue: T) => void
}

/** create special subscribable */
export function createTaskSubscribable<T>(
  defaultValue: MayFn<T>,
  options?: CreateTaskSubscribableOptions<T>,
): TaskSubscribable<T>
export function createTaskSubscribable<T>(
  subscribable: Subscribable<T>,
  options?: CreateTaskSubscribableOptions<T>,
): TaskSubscribable<T>
export function createTaskSubscribable<T>(
  ...args:
    | [subscribable: Subscribable<T>, options?: CreateTaskSubscribableOptions<T>]
    | [defaultValue: any, options?: CreateTaskSubscribableOptions<T>]
): TaskSubscribable<T> {
  const defaultedArgs = (isSubscribable(args[0]) ? [args[0], args[1]] : [createSubscribable(args[0]), args[1]]) as [
    subscribable: Subscribable<T>,
    options?: CreateTaskSubscribableOptions<T>,
  ]
  const [subscribable, options] = defaultedArgs

  const proxiedSubscribable = observe(
    Object.assign(subscribable, {
      [TaskSubscribableTag]: true,
      /**
       * only effect exector will auto run if it's any observed TaskSubscribable is visiable \
       * visiable, so effect is meaningful for user
       */
      visiable: createSubscribable(Boolean(options?.visiable)),
      subscribedExecutors: new WeakerSet<TaskExecutor>(),
    }) as TaskSubscribable<T>,
    Object.assign((value) => {
      options?.onAccessed?.(value)
    }, {}),
  )

  const invokeTaskExecutors = () => invokeBindedExecutors(proxiedSubscribable)
  proxiedSubscribable.subscribe(invokeTaskExecutors)
  proxiedSubscribable.visiable.subscribe(invokeTaskExecutors)
  return proxiedSubscribable as TaskSubscribable<T>
}

export function isTaskSubscribable<T>(value: any): value is TaskSubscribable<T> {
  return isSubscribable(value) && value[TaskSubscribableTag] === true
}

export function isTaskSubscribableVisiable<T>(value: TaskSubscribable<T>) {
  return value.visiable()
}

/**
 * high function that create value getter from subscribable
 */
export function getSubscribableWithContext<T>(context: TaskExecutor, subscribable: TaskSubscribable<T>) {
  subscribable.subscribedExecutors.add(context)
  return subscribable()
}

export function invokeBindedExecutors(subscribable: TaskSubscribable<any>) {
  subscribable.subscribedExecutors.forEach(invokeExecutor)
}

export function setTaskSubscribableVisiable<T>(value: TaskSubscribable<T>, visiable: boolean) {
  value.visiable.set(visiable)
}
export function visiableTaskSubscribable<T>(value: TaskSubscribable<T>) {
  setTaskSubscribableVisiable(value, true)
}
export function invisiableTaskSubscribable<T>(value: TaskSubscribable<T>) {
  setTaskSubscribableVisiable(value, false)
}
