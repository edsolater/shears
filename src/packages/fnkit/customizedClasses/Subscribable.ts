import { AnyFn, isFunction, isObject } from '@edsolater/fnkit'

// TODO: should support clean function
export type SubscribeCallbackFn<T> = (value: T, prevValue: T | undefined) => void | Promise<void>

type Dispatcher<T> = T | ((oldValue: T) => T | PromiseLike<T>)
type MayWeakRef<T> = T extends object | AnyFn ? WeakRef<T> : T

function createMayWeakRef<T>(value: T): MayWeakRef<T> {
  //@ts-ignore
  return isObject(value) || isFunction(value) ? new WeakRef(value) : value
}

function deMayWeakRef<T>(value: MayWeakRef<T> | T): T | undefined {
  return value instanceof WeakRef ? value.deref() : value
}

// TODO: need to be like Promise
export class Subscribable<T> {
  /** it's current value */
  private _values: MayWeakRef<T>[] = []
  private _callbacks = new Set<SubscribeCallbackFn<T>>()

  /** for easier debug a data graph */
  extendedSubscribables: WeakSet<WeakRef<Subscribable<any>>> = new WeakSet()

  /** executor is just a function to be invoked (inspired from `new Promise(executor)`) */
  constructor(executor?: (injectValue: (value: T | PromiseLike<T>) => void) => void) {
    executor?.(this.innerInject.bind(this))
  }

  /**
   * inner method of Subscribable, to inject value and invoke callbacks
   */
  private async innerInject(mayAsyncValue: T | PromiseLike<T>) {
    const values = await mayAsyncValue
    this._values.push(createMayWeakRef(values))
    const currentValue = deMayWeakRef(this._values.at(-1))
    const prevValue = deMayWeakRef(this._values.at(-2))
    if (currentValue == null) return
    this._callbacks.forEach((cb) => {
      cb(currentValue, prevValue)
    })
  }

  get current() {
    return deMayWeakRef(this._values.at(-1))
  }

  /**
   * create a new subscribable from another subscribable;
   */
  clone() {
    return new Subscribable<T>((injectValue) => {
      this.subscribe(injectValue)
    })
  }

  /** link to another subscribable */
  extends<U extends T>(another: Subscribable<U>) {
    const weakRefAnother = new WeakRef(another)
    this.extendedSubscribables.add(weakRefAnother)
    const { abort } = another.subscribe((value) => this.innerInject(value))
    return {
      disconnect: () => {
        this.extendedSubscribables.delete(weakRefAnother)
        abort()
      }
    }
  }

  /**
   * main method of Subscribable
   * use this function to create a new subscribable
   */
  pipe<U>(fn: (value: T) => U) {
    return new Subscribable<U>((injectValue) => {
      this.subscribe((value) => injectValue(fn(value)))
    })
  }

  /**
   * main method of Subscribable
   * use this function to register a callback
   */
  subscribe(callback: SubscribeCallbackFn<T>) {
    this._callbacks.add(callback)
    return {
      abort: () => this._callbacks.delete(callback)
    }
  }

  /**
   * this method is simulate `promise.prototype.then`
   * like subscribe
   * but it won't return a subscription, instead it will return a new subscribable
   */
  then<U>(onFulfilled: (value: T) => U | PromiseLike<U>) {
    return new Subscribable<U>((injectValue) => {
      this.subscribe((value) => {
        injectValue(onFulfilled(value))
      })
    })
  }

  /**
   * for user, try not to use this, it is more predicatable to use only executor
   */
  inject(dispatcher: Dispatcher<T | undefined>) {
    const newValue = isFunction(dispatcher) ? dispatcher(deMayWeakRef(this._values.at(-1))) : dispatcher
    if (!newValue) return
    else if (isPromiseLike(newValue)) {
      newValue.then((value) => value && this.innerInject(value))
    } else {
      this.innerInject(newValue)
    }
  }

  /**
   * Subscribable should be just richer version of Promise
   */
  static fromPromises<T extends Promise<any>[]>(promises: [...T]) {
    return new Subscribable<GetPromiseArrayItem<T>>((injectValue) => {
      const promiseValues = promises.map(() => undefined) as any[]
      promises.forEach((promise, index) => {
        promise.then((value) => {
          promiseValues[index] = value
          if (promiseValues.some((value) => value != null)) {
            injectValue(promiseValues as any)
          }
        })
      })
    })
  }

  toPromise() {
    return new Promise<T>((resolve) => {
      this.subscribe(resolve)
    })
  }
}

type GetPromiseArrayItem<T extends Promise<any>[]> = T extends [Promise<infer F>]
  ? [F | undefined]
  : T extends [Promise<infer F>, Promise<infer R>]
  ? [F | undefined, R | undefined]
  : T extends [Promise<infer F>, Promise<infer R>, Promise<infer P>]
  ? [F | undefined, R | undefined, P | undefined]
  : T extends [Promise<infer F>, Promise<infer R>, Promise<infer P>, Promise<infer Q>]
  ? [F | undefined, R | undefined, P | undefined, Q | undefined]
  : T extends [Promise<infer F>, Promise<infer R>, Promise<infer P>, Promise<infer Q>, Promise<infer S>]
  ? [F | undefined, R | undefined, P | undefined, Q | undefined, S | undefined]
  : T extends [
      Promise<infer F>,
      Promise<infer R>,
      Promise<infer P>,
      Promise<infer Q>,
      Promise<infer S>,
      Promise<infer T>
    ]
  ? [F | undefined, R | undefined, P | undefined, Q | undefined, S | undefined, T | undefined]
  : never

export function isPromiseLike(target: unknown): target is PromiseLike<unknown> {
  return isObject(target) && (target instanceof Promise || 'then' in target)
}
