/**
 * *********
 * observe user action towards the object|function
 * *********
 */
import { observe } from '../../fnkit/observe'
import { Subscribable } from './core'

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
export function createTask(task: () => void) {
  const execute = () => {
    excutorStack.push(execute)
    try {
      task()
    } finally {
      excutorStack.pop()
    }
  }
  execute()
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
          const subscribedExcuters = allSubscribedExcuters.get(subscribable)
          if (subscribedExcuters) {
            subscribedExcuters.add(currentExcutor)
          } else {
            allSubscribedExcuters.set(subscribable, new Set([currentExcutor]))
          }
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
