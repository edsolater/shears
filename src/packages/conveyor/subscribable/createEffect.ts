/**
 * *********
 * observe user action towards the object|function
 * *********
 */
import { observe } from '../../fnkit/observe'
import { Subscribable } from './core'
import { withDefault } from '../../fnkit/withDefault'

type EffectExcuter = () => void

const excutorStack: (() => void)[] = []

// global stack
const allSubscribedExcuters = new WeakMap<Subscribable<any>, Set<EffectExcuter>>()

/**
 * add ability to pure subscribable
 */
const subscribedExcutersSymbol = Symbol('subscribedExcuters')
interface ObservableSubscribable<T> extends Subscribable<T> {
  [subscribedExcutersSymbol]: Set<EffectExcuter>
}

function getCurrentEffectExcutor() {
  return excutorStack[excutorStack.length - 1]
}

/**
 * like solidjs's createEffect, will track all subscribable's getValue option in it
 */
export function createTask(task: (get: <T>(v: Subscribable<T>) => T) => void) {
  const execute = () => {
    excutorStack.push(execute)
    try {
      task(getWithSubscribe)
    } finally {
      excutorStack.pop()
    }
  }
  execute()
}

function getWithSubscribe<T>(subscribable: Subscribable<T>): T {
  return subscribable()
}

/** create special subscribable */
export function observableSubscribable<T>(
  subscribable: Subscribable<T>,
  options: { onInvoke?: (currentValue: T) => void },
): ObservableSubscribable<T> {
  const proxiedSubscribable = observe(
    subscribable,
    Object.assign((value) => {
      const currentExcutor = getCurrentEffectExcutor()
      if (currentExcutor) {
        {
          // attach to global excutorStack
          withDefault(allSubscribedExcuters.get(subscribable), () => {
            const set: Set<EffectExcuter> = new Set()
            allSubscribedExcuters.set(subscribable, set)
            return set
          }).add(currentExcutor)
        }
        {
          // attach to local excutorStack
          const subscribedExcuters = subscribable[subscribedExcutersSymbol]
          if (subscribedExcuters) {
            subscribedExcuters.add(currentExcutor)
          } else {
            subscribable[subscribedExcutersSymbol] = new Set([currentExcutor])
          }
        }
      }
      if (options.onInvoke) options.onInvoke(value)
    }, {}),
  )
  return proxiedSubscribable as ObservableSubscribable<T>
}


