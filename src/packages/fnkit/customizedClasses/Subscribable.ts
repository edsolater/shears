import { isFunction } from '@edsolater/fnkit'

export type SubscribeCallbackFn<T> = ((value: T) => void | Promise<void>) | ((newValue: T) => void)

type Dispatcher<T> = T | ((oldValue: T) => T)

export class Subscribable<T> {
  private _value: T | undefined = undefined
  private _callbacks = new Set<SubscribeCallbackFn<T>>()

  private async inputValue(mayAsyncValue: T | PromiseLike<T>) {
    this._value = await mayAsyncValue
    this._callbacks.forEach((cb) => {
      this._value != null && cb(this._value)
    })
  }

  constructor(executor?: (injectValue: (value: T | PromiseLike<T>) => void) => void) {
    executor?.(this.inputValue.bind(this))
  }

  get current() {
    return this._value
  }

  subscribe(cb: SubscribeCallbackFn<T>) {
    this._callbacks.add(cb)
    return {
      abort: () => this._callbacks.delete(cb)
    }
  }

  /** try not to use, it is more predicatable to use only executor */
  injectValue(dispatcher: Dispatcher<T | PromiseLike<T> | undefined>) {
    const newValue = isFunction(dispatcher) ? dispatcher(this._value) : dispatcher
    if (newValue) this.inputValue(newValue)
  }
}
