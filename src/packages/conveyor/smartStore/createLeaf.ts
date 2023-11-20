import { MayFn, WeakerSet } from '@edsolater/fnkit'
import { observe } from '../../fnkit/observe'
import { Subscribable, createSubscribable, isSubscribable } from '../subscribable/core'
import { TaskExecutor, invokeExecutor } from './createTask'
import { LeafOption, isLeafOption } from './createLeafOption'

export const leafTag = Symbol('LeafTag')
export const leafOptionTag = Symbol('leafOptionTag')

/**
 * add ability to pure subscribable
 */
export interface Leaf<T> extends Subscribable<T> {
  id: string
  /**
   * used by TaskExecutor to track subscribable's visiability
   *
   * only effect exector will auto run if it's any observed Leaf is visiable \
   * visiable, so effect is meaningful for user
   */
  visiable: Subscribable<boolean>
  // when set this, means this object is a observable-subscribable
  [leafTag]: boolean
  subscribedExecutors: WeakerSet<TaskExecutor>
}

export interface CreateLeafOptions<T> {
  visiable?: boolean | 'auto' // TODO: inply it means auto
  onAccessed?: (currentValue: T) => void
}

let globalLeafId = 0
/** create special subscribable */
export function createLeaf<T>(defaultValue: MayFn<T>, options?: CreateLeafOptions<T>): Leaf<T>
export function createLeaf<T>(subscribable: Subscribable<T>, options?: CreateLeafOptions<T>): Leaf<T>
export function createLeaf<T>(option: LeafOption<T>): Leaf<T>
export function createLeaf<T>(
  ...args:
    | [subscribable: Subscribable<T>, options?: CreateLeafOptions<T>]
    | [defaultValue: any, options?: CreateLeafOptions<T>]
    | [option: LeafOption<T>]
): Leaf<T> {
  const leafId = globalLeafId++

  const defaultedArgs = (
    isSubscribable(args[0])
      ? [args[0], args[1]]
      : isLeafOption(args[0])
        ? [createSubscribable(args[0].value), args[0]]
        : [createSubscribable(args[0]), args[1]]
  ) as [subscribable: Subscribable<T>, options?: CreateLeafOptions<T>]
  const [subscribable, options] = defaultedArgs

  const proxiedSubscribable = observe(
    Object.assign(subscribable, {
      [leafTag]: true,
      id: `leaf_${leafId}`,
      /**
       * only effect exector will auto run if it's any observed Leaf is visiable \
       * visiable, so effect is meaningful for user
       */
      visiable: createSubscribable(Boolean(options?.visiable)),
      subscribedExecutors: new WeakerSet<TaskExecutor>(),
    }) as Leaf<T>,
    Object.assign((value) => {
      options?.onAccessed?.(value)
    }, {}),
  )

  const invokeTaskExecutors = () => invokeBindedExecutors(proxiedSubscribable)
  proxiedSubscribable.subscribe(invokeTaskExecutors)
  proxiedSubscribable.visiable.subscribe(invokeTaskExecutors)
  return proxiedSubscribable as Leaf<T>
}

export function isLeaf<T>(value: any): value is Leaf<T> {
  return Boolean(isSubscribable(value) && value[leafTag])
}

export function isLeafVisiable<T>(value: Leaf<T>) {
  return value.visiable()
}

/**
 * high function that create value getter from subscribable
 */
export function getSubscribableWithContext<T>(context: TaskExecutor, subscribable: Leaf<T>) {
  subscribable.subscribedExecutors.add(context)
  return subscribable()
}

export function invokeBindedExecutors(subscribable: Leaf<any>) {
  subscribable.subscribedExecutors.forEach(invokeExecutor)
}

export function setLeafVisiable<T>(value: Leaf<T>, visiable: boolean) {
  value.visiable.set(visiable)
}
export function visiableLeaf<T>(value: Leaf<T>) {
  setLeafVisiable(value, true)
}
export function invisiableLeaf<T>(value: Leaf<T>) {
  setLeafVisiable(value, false)
}
