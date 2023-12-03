import { MayFn, WeakerSet } from '@edsolater/fnkit'
import { observe } from '../../fnkit/observe'
import { Subscribable, createSubscribable, isSubscribable } from '../subscribable/core'
import { TaskExecutor, invokeExecutor } from './createTask'
import { ShuckOption, isShuckOption } from './createShuckOption'

export const shuckTag = Symbol('shuckTag')
export const shuckOptionTag = Symbol('shuckOptionTag')

/**
 * add ability to pure subscribable
 */
export interface Shuck<T> extends Subscribable<T> {
  id: string
  /**
   * used by TaskExecutor to track subscribable's visiability
   *
   * only effect exector will auto run if it's any observed Shuck is visiable \
   * visiable, so effect is meaningful 0for user
   */
  visiable: Subscribable<boolean>
  // when set this, means this object is a observable-subscribable
  [shuckTag]: boolean
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

export function setShuckVisiable<T>(value: Shuck<T>, visiable: boolean) {
  value.visiable.set(visiable)
}
