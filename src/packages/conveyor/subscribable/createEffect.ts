/**
 * *********
 * observe user action towards the object|function
 * *********
 */
import { MayFn, WeakerSet } from '@edsolater/fnkit'
import { invoke } from '../../fnkit'
import { observe } from '../../fnkit/observe'
import { Subscribable, createSubscribable, isSubscribable } from './core'

type EffectExcuter = { (): void; relatedSubscribables: WeakerSet<Subscribable<any>> }

const trackableSubscribableTag = Symbol('observableSubscribable')

/**
 * add ability to pure subscribable
 */
interface TrackableSubscribable<T> extends Subscribable<T> {
  // when set this, means this object is a observable-subscribable
  [trackableSubscribableTag]: boolean
  subscribedExcuters: WeakerSet<EffectExcuter>
}

/**
 * like solidjs's createEffect, will track all subscribable's getValue option in it
 */
export function createTask(task: (get: <T>(v: TrackableSubscribable<T>) => T) => void) {
  const execute = () => {
    function get<T>(subscribable: TrackableSubscribable<T>) {
      recordSubscribableToContext(subscribable, execute)
      return getSubscribableWithContext(execute, subscribable)
    }
    task(get)
  }
  execute.relatedSubscribables = new WeakerSet<TrackableSubscribable<any>>()
  execute()
}

/**
 * high function that create value getter from subscribable
 */
function getSubscribableWithContext<T>(context: EffectExcuter, subscribable: TrackableSubscribable<T>) {
  subscribable.subscribedExcuters.add(context)
  return subscribable()
}

function recordSubscribableToContext<T>(subscribable: TrackableSubscribable<T>, context: EffectExcuter) {
  context.relatedSubscribables.add(subscribable)
}

type CreateObservableSubscribableOptions<T> = {
  onAccessed?: (currentValue: T) => void
}

/** create special subscribable */
export function createTrackableSubscribable<T>(
  defaultValue: MayFn<T>,
  options?: CreateObservableSubscribableOptions<T>,
): TrackableSubscribable<T>
export function createTrackableSubscribable<T>(
  subscribable: Subscribable<T>,
  options?: CreateObservableSubscribableOptions<T>,
): TrackableSubscribable<T>
export function createTrackableSubscribable<T>(
  ...args:
    | [subscribable: Subscribable<T>, options?: CreateObservableSubscribableOptions<T>]
    | [defaultValue: any, options?: CreateObservableSubscribableOptions<T>]
): TrackableSubscribable<T> {
  const defaultedArgs = (isSubscribable(args[0]) ? [args[0], args[1]] : [createSubscribable(args[0]), args[1]]) as [
    subscribable: Subscribable<T>,
    options?: CreateObservableSubscribableOptions<T>,
  ]
  const [subscribable, options] = defaultedArgs

  const proxiedSubscribable = observe(
    Object.assign(subscribable, {
      [trackableSubscribableTag]: true,
      subscribedExcuters: new WeakerSet<EffectExcuter>(),
    }) as TrackableSubscribable<T>,
    Object.assign((value) => {
      options?.onAccessed?.(value)
    }, {}),
  )

  proxiedSubscribable.subscribe(() => {
    proxiedSubscribable.subscribedExcuters.forEach(invoke)
  })
  return proxiedSubscribable as TrackableSubscribable<T>
}

export function isTrackableSubscribable<T>(value: any): value is TrackableSubscribable<T> {
  return isSubscribable(value) && value[trackableSubscribableTag] === true
}
