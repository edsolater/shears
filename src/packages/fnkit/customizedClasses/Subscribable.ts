import { isFunction } from '@edsolater/fnkit'

export type SubscribeCallbackFn<T> = ((value: T) => void | Promise<void>) | ((newValue: T) => void)

type Dispatcher<T> = T | ((oldValue: T) => T)

// TODO: need to be like Promise
export class Subscribable<T> {
  /** it's current value */
  private _value: T | undefined = undefined

  private _callbacks = new Set<SubscribeCallbackFn<T>>()

  /** for easier debug a data graph */
  extendedSubscribables: WeakSet<WeakRef<Subscribable<any>>> = new WeakSet()

  constructor(executor?: (injectValue: (value: T | PromiseLike<T>) => void) => void) {
    executor?.(this.inputValue)
  }

  /**
   * inner method of Subscribable, to inject value and invoke callbacks
   */
  private async inputValue(mayAsyncValue: T | PromiseLike<T>) {
    this._value = await mayAsyncValue
    this._callbacks.forEach((cb) => {
      this._value != null && cb(this._value)
    })
  }

  get current() {
    return this._value
  }

  /**
   * main method of Subscribable
   * use this function to register a callback
   */
  subscribe(cb: SubscribeCallbackFn<T>) {
    this._callbacks.add(cb)
    return {
      abort: () => this._callbacks.delete(cb)
    }
  }

  /**
   * for user, try not to use this, it is more predicatable to use only executor
   */
  inject(dispatcher: Dispatcher<T | PromiseLike<T> | undefined>) {
    const newValue = isFunction(dispatcher) ? dispatcher(this._value) : dispatcher
    if (newValue) this.inputValue(newValue)
  }

  
  /** Subscribable should be just richer version of Promise  */
  static fromPromise<T>(promise: Promise<T>) {
    return new Subscribable<T>((injectValue) => {
      promise.then(injectValue)
    })
  }

  toPromise() {
    return new Promise<T>((resolve) => {
      this.subscribe(resolve)
    })
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
    const { abort } = another.subscribe((value) => this.inputValue(value))
    return {
      disconnect: () => {
        this.extendedSubscribables.delete(weakRefAnother)
        abort()
      }
    }
  }
  
  pipe<U>(fn: (value: T) => U) {
    return new Subscribable<U>((injectValue) => {
      this.subscribe((value) => injectValue(fn(value)))
    })
  }
}
