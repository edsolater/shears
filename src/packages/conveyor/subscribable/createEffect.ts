/**
 * *********
 * observe user action towards the object|function
 * *********
 */
import { MayFn, WeakerSet } from '@edsolater/fnkit'
import { observe } from '../../fnkit/observe'
import { Subscribable, createSubscribable, isSubscribable } from './core'
import { invoke } from '../../fnkit'

type EffectExcuter = () => void

const trackableSubscribableTag = Symbol('observableSubscribable')

/**
 * add ability to pure subscribable
 */
interface ObservableSubscribable<T> extends Subscribable<T> {
  // when set this, means this object is a observable-subscribable
  [trackableSubscribableTag]: boolean
  subscribedExcuters: WeakerSet<EffectExcuter>
}

/**
 * like solidjs's createEffect, will track all subscribable's getValue option in it
 */
export function createTask(task: (get: <T>(v: ObservableSubscribable<T>) => T) => void) {
  const execute = () => {
    const get = createGetterWithContext(execute)
    task(get)
  }
  execute()
}

/**
 * high function that create value getter from subscribable
 */
const createGetterWithContext =
  (context: EffectExcuter) =>
  <T>(subscribable: ObservableSubscribable<T>) => {
    subscribable.subscribedExcuters.add(context)
    return subscribable()
  }

type CreateObservableSubscribableOptions<T> = {
  onAccessed?: (currentValue: T) => void
}

/** create special subscribable */
export function createTrackableSubscribable<T>(
  defaultValue: MayFn<T>,
  options?: CreateObservableSubscribableOptions<T>,
): ObservableSubscribable<T>
export function createTrackableSubscribable<T>(
  subscribable: Subscribable<T>,
  options?: CreateObservableSubscribableOptions<T>,
): ObservableSubscribable<T>
export function createTrackableSubscribable<T>(
  ...args:
    | [subscribable: Subscribable<T>, options?: CreateObservableSubscribableOptions<T>]
    | [defaultValue: any, options?: CreateObservableSubscribableOptions<T>]
): ObservableSubscribable<T> {
  const defaultedArgs = (isSubscribable(args[0]) ? [args[0], args[1]] : [createSubscribable(args[0]), args[1]]) as [
    subscribable: Subscribable<T>,
    options?: CreateObservableSubscribableOptions<T>,
  ]
  const [subscribable, options] = defaultedArgs

  const proxiedSubscribable = observe(
    Object.assign(subscribable, {
      [trackableSubscribableTag]: true,
      subscribedExcuters: new WeakerSet<EffectExcuter>(),
    }) as ObservableSubscribable<T>,
    Object.assign((value) => {
      options?.onAccessed?.(value)
    }, {}),
  )

  proxiedSubscribable.subscribe(() => {
    proxiedSubscribable.subscribedExcuters.forEach(invoke)
  })
  return proxiedSubscribable as ObservableSubscribable<T>
}

export function isTrackableSubscribable<T>(value: any): value is ObservableSubscribable<T> {
  return isSubscribable(value) && value[trackableSubscribableTag] === true
}
