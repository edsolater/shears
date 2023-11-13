import { MayFn, WeakerSet } from '@edsolater/fnkit'
import { invoke } from '../../fnkit'
import { observe } from '../../fnkit/observe'
import { Subscribable, createSubscribable, isSubscribable } from './core'
import { TaskExecutor } from './createTask'

export const trackableSubscribableTag = Symbol('observableSubscribable')
/**
 * add ability to pure subscribable
 */
export interface TrackableSubscribable<T> extends Subscribable<T> {
  /**
   * only effect exector will auto run if it's any observed trackableSubscribable is visiable \
   * visiable, so effect is meaningful for user
   */
  isVisiable: boolean
  // when set this, means this object is a observable-subscribable
  [trackableSubscribableTag]: boolean
  subscribedExecutors: WeakerSet<TaskExecutor>
}
interface CreateTrackableSubscribableOptions<T> {
  initVisiable?: boolean
  onAccessed?: (currentValue: T) => void
}
/** create special subscribable */

export function createTrackableSubscribable<T>(
  defaultValue: MayFn<T>,
  options?: CreateTrackableSubscribableOptions<T>,
): TrackableSubscribable<T>
export function createTrackableSubscribable<T>(
  subscribable: Subscribable<T>,
  options?: CreateTrackableSubscribableOptions<T>,
): TrackableSubscribable<T>
export function createTrackableSubscribable<T>(
  ...args:
    | [subscribable: Subscribable<T>, options?: CreateTrackableSubscribableOptions<T>]
    | [defaultValue: any, options?: CreateTrackableSubscribableOptions<T>]
): TrackableSubscribable<T> {
  const defaultedArgs = (isSubscribable(args[0]) ? [args[0], args[1]] : [createSubscribable(args[0]), args[1]]) as [
    subscribable: Subscribable<T>,
    options?: CreateTrackableSubscribableOptions<T>,
  ]
  const [subscribable, options] = defaultedArgs

  const proxiedSubscribable = observe(
    Object.assign(subscribable, {
      [trackableSubscribableTag]: true,
      /**
       * only effect exector will auto run if it's any observed trackableSubscribable is visiable \
       * visiable, so effect is meaningful for user
       */
      isVisiable: Boolean(options?.initVisiable),
      subscribedExecutors: new WeakerSet<TaskExecutor>(),
    }) as TrackableSubscribable<T>,
    Object.assign((value) => {
      options?.onAccessed?.(value)
    }, {}),
  )

  proxiedSubscribable.subscribe(() => invokeBindedExecutors(proxiedSubscribable))
  return proxiedSubscribable as TrackableSubscribable<T>
}

function invokeBindedExecutors(subscribable: TrackableSubscribable<any>) {
  subscribable.subscribedExecutors.forEach((executor) => {
    if (executor.visiable) invoke(executor)
  })
}

export function isTrackableSubscribable<T>(value: any): value is TrackableSubscribable<T> {
  return isSubscribable(value) && value[trackableSubscribableTag] === true
}

export function isTrackableSubscribableVisiable<T>(value: TrackableSubscribable<T>) {
  return value.isVisiable
}

export function setTrackableSubscribableVisiable<T>(value: TrackableSubscribable<T>, visiable: boolean) {
  value.isVisiable = visiable
}
