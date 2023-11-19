import { MayFn, WeakerSet } from '@edsolater/fnkit'
import { observe } from '../../fnkit/observe'
import { Subscribable, createSubscribable, isSubscribable } from '../subscribable/core'
import { TaskExecutor, invokeExecutor } from './createTask'
import { TaskAtomOption, isTaskAtomOption } from './createTaskAtomOption'

export const taskAtomTag = Symbol('TaskAtomTag')
export const taskOptionTag = Symbol('taskOptionTag')

/**
 * add ability to pure subscribable
 */
export interface TaskAtom<T> extends Subscribable<T> {
  id: string
  /**
   * used by TaskExecutor to track subscribable's visiability
   *
   * only effect exector will auto run if it's any observed TaskAtom is visiable \
   * visiable, so effect is meaningful for user
   */
  visiable: Subscribable<boolean>
  // when set this, means this object is a observable-subscribable
  [taskAtomTag]: boolean
  subscribedExecutors: WeakerSet<TaskExecutor>
}

export interface CreateTaskAtomOptions<T> {
  visiable?: boolean | 'auto' // TODO: inply it means auto
  onAccessed?: (currentValue: T) => void
}

let globalTaskAtomId = 0
/** create special subscribable */
export function createTaskAtom<T>(defaultValue: MayFn<T>, options?: CreateTaskAtomOptions<T>): TaskAtom<T>
export function createTaskAtom<T>(subscribable: Subscribable<T>, options?: CreateTaskAtomOptions<T>): TaskAtom<T>
export function createTaskAtom<T>(option: TaskAtomOption<T>): TaskAtom<T>
export function createTaskAtom<T>(
  ...args:
    | [subscribable: Subscribable<T>, options?: CreateTaskAtomOptions<T>]
    | [defaultValue: any, options?: CreateTaskAtomOptions<T>]
    | [option: TaskAtomOption<T>]
): TaskAtom<T> {
  const taskAtomId = globalTaskAtomId++

  const defaultedArgs = (
    isSubscribable(args[0])
      ? [args[0], args[1]]
      : isTaskAtomOption(args[0])
        ? [createSubscribable(args[0].value), args[0]]
        : [createSubscribable(args[0]), args[1]]
  ) as [subscribable: Subscribable<T>, options?: CreateTaskAtomOptions<T>]
  const [subscribable, options] = defaultedArgs

  const proxiedSubscribable = observe(
    Object.assign(subscribable, {
      [taskAtomTag]: true,
      id: `taskAtom_${taskAtomId}`,
      /**
       * only effect exector will auto run if it's any observed TaskAtom is visiable \
       * visiable, so effect is meaningful for user
       */
      visiable: createSubscribable(Boolean(options?.visiable)),
      subscribedExecutors: new WeakerSet<TaskExecutor>(),
    }) as TaskAtom<T>,
    Object.assign((value) => {
      options?.onAccessed?.(value)
    }, {}),
  )

  const invokeTaskExecutors = () => invokeBindedExecutors(proxiedSubscribable)
  proxiedSubscribable.subscribe(invokeTaskExecutors)
  proxiedSubscribable.visiable.subscribe(invokeTaskExecutors)
  return proxiedSubscribable as TaskAtom<T>
}

export function isTaskAtom<T>(value: any): value is TaskAtom<T> {
  return Boolean(isSubscribable(value) && value[taskAtomTag])
}

export function isTaskAtomVisiable<T>(value: TaskAtom<T>) {
  return value.visiable()
}

/**
 * high function that create value getter from subscribable
 */
export function getSubscribableWithContext<T>(context: TaskExecutor, subscribable: TaskAtom<T>) {
  subscribable.subscribedExecutors.add(context)
  return subscribable()
}

export function invokeBindedExecutors(subscribable: TaskAtom<any>) {
  subscribable.subscribedExecutors.forEach(invokeExecutor)
}

export function setTaskAtomVisiable<T>(value: TaskAtom<T>, visiable: boolean) {
  value.visiable.set(visiable)
}
export function visiableTaskAtom<T>(value: TaskAtom<T>) {
  setTaskAtomVisiable(value, true)
}
export function invisiableTaskAtom<T>(value: TaskAtom<T>) {
  setTaskAtomVisiable(value, false)
}
