import { MayFn, WeakerSet } from '@edsolater/fnkit'
import { observe } from '../../fnkit/observe'
import { Subscribable, createSubscribable, isSubscribable } from '../subscribable/core'
import { TaskExecutor, invokeExecutor } from './task'
import { ShuckOption, isShuckOption } from './shuckOption'

export const shuckTag = Symbol('shuckTag')
export const shuckOptionTag = Symbol('shuckOptionTag')

/**
 * add ability to pure subscribable
 */
export interface Shuck<T> extends Subscribable<T> {
  /** when detected, it is a Shuck  */
  [shuckTag]: boolean
  id: string
  /**
   * used by TaskExecutor to track subscribable's visiability
   *
   * when no visiableCheckers, means this subscribable is hidden
   * when any of visiableCheckers is true, means this subscribable is visiable;
   * when all of visiableCheckers is false, means this subscribable is hidden
   *
   * only effect exector will auto run if it's any observed Shuck is visiable \
   * visiable, so effect is meaningful 0for user
   */
  visiable: Subscribable<boolean>
  visiableCheckers: Map<any, boolean>
  // when set this, means this object is a observable-subscribable
  subscribedExecutors: WeakerSet<TaskExecutor>
}

export interface CreateShuckOptions<T> {
  visiable?: boolean | 'auto' // TODO: inply it means auto
  onAccessed?: (currentValue: T) => void
}

let globalShuckId = 0

/** create special subscribable */
export function createShuck<T>(defaultValue: MayFn<T>, options?: CreateShuckOptions<T>): Shuck<T>
export function createShuck<T>(subscribable: Subscribable<T>, options?: CreateShuckOptions<T>): Shuck<T>
export function createShuck<T>(option: ShuckOption<T>): Shuck<T>
export function createShuck<T>(
  ...args:
    | [subscribable: Subscribable<T>, options?: CreateShuckOptions<T>]
    | [defaultValue: any, options?: CreateShuckOptions<T>]
    | [option: ShuckOption<T>]
): Shuck<T> {
  const id = globalShuckId++

  const defaultedArgs = (
    isSubscribable(args[0])
      ? [args[0], args[1]]
      : isShuckOption(args[0])
        ? [createSubscribable(args[0].value), args[0]]
        : [createSubscribable(args[0]), args[1]]
  ) as [subscribable: Subscribable<T>, options?: CreateShuckOptions<T>]
  const [subscribable, options] = defaultedArgs

  const proxiedSubscribable = observe(
    Object.assign(subscribable, {
      [shuckTag]: true,
      id: `shuck_${id}`,
      /**
       * only effect exector will auto run if it's any observed Shuck is visiable \
       * visiable, so effect is meaningful for user
       */
      visiable: createSubscribable(Boolean(options?.visiable)),
      subscribedExecutors: new WeakerSet<TaskExecutor>(),
    }) as Shuck<T>,
    Object.assign((value) => {
      options?.onAccessed?.(value)
    }, {}),
  )

  const invokeTaskExecutors = () => invokeBindedExecutors(proxiedSubscribable)
  proxiedSubscribable.subscribe(invokeTaskExecutors)
  proxiedSubscribable.visiable.subscribe(invokeTaskExecutors)
  return proxiedSubscribable as Shuck<T>
}

export function isShuck<T>(value: any): value is Shuck<T> {
  return Boolean(isSubscribable(value) && value[shuckTag])
}

export function isShuckVisiable<T>(value: Shuck<T>) {
  return value.visiable()
}

export function isShuckHidden<T>(value: Shuck<T>) {
  return !value.visiable()
}

/**
 * high function that create value getter from subscribable
 */
export function recordSubscribableToAtom<T>(context: TaskExecutor, subscribable: Shuck<T>) {
  return subscribable.subscribedExecutors.add(context)
}

export function invokeBindedExecutors(subscribable: Shuck<any>) {
  if (subscribable.subscribedExecutors.size === 0) return
  subscribable.subscribedExecutors.forEach(invokeExecutor)
}

export function updateShuckVisiable<T>(shuck: Shuck<T>) {
  for (const isVisiable of shuck.visiableCheckers.values()) {
    if (isVisiable) {
      shuck.visiable.set(true)
      return
    }
  }
  shuck.visiable.set(false)
  return
}

export function setShuckVisiableChecker<T>(shuck: Shuck<T>, visiable: boolean, key: any) {
  shuck.visiableCheckers.set(key, visiable)
  updateShuckVisiable(shuck)
}

export function deleteShuckVisibaleChecker<T>(shuck: Shuck<T>, key: any) {
  shuck.visiableCheckers.delete(key)
  updateShuckVisiable(shuck)
}

export function visualizeShuck<T>(shuck: Shuck<T>, key: any) {
  setShuckVisiableChecker(shuck, true, key)
}

export function hideShuck<T>(shuck: Shuck<T>, key: any) {
  setShuckVisiableChecker(shuck, false, key)
}
