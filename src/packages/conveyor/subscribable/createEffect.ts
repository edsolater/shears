/**
 * *********
 * observe user action towards the object|function
 * *********
 */
import { Subscribable } from './core'
import { AnyFn, AnyObj, isFunction, isObject } from '@edsolater/fnkit'
import { assert } from 'vitest'

type EffectExcuter = () => void

const subscribedExcuters = new WeakMap<HaveSubscribeExcuter, Set<EffectExcuter>>()
const subscribedExcutersSymbol = Symbol('subscribedExcuters')

interface HaveSubscribeExcuter {
  [subscribedExcutersSymbol]: Set<EffectExcuter>
}

type ObserveOption<O extends AnyObj | AnyFn> = {
  '()'?: (result: ReturnType<O & AnyFn>, ...params: any[]) => any
} & {
  [K in keyof O]?: (originalValue: O[K]) => any
}

function createObserableSubscribable<T>(
  subscribable: Subscribable<T>,
  options: { onInvoke?: (currentValue: T) => void },
) {
  const handlers: ProxyHandler<Subscribable<T>> = {
    apply(target, thisArg, argArray) {
      const result = Reflect.apply(target, thisArg, argArray)
      options.onInvoke?.(result)
      return result
    },
    get(target, p, receiver) {
      const property = Reflect.get(target, p, receiver)
      return isFunction(property) || isObject(property)
        ? new Proxy(property, handlers) /* recursively observer user operation */
        : property
    },
  }
  return new Proxy(subscribable, handlers)
}
