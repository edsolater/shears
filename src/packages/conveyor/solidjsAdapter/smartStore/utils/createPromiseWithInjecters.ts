export type PromiseWithInjecters<T = any> = {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason?: any) => void
}
export function createPromiseWithInjecters<T = any>(): PromiseWithInjecters<T> {
  let resolve: (value: T) => void
  let reject: (reason?: any) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve: resolve!, reject: reject! }
}
