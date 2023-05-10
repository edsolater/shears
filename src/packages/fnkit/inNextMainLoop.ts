/**
 * calculate in the next event loop
 *
 * usually used in **Promise's** `then()` methods
 */
export function inNextMainLoop<T, U>(fn: (result: T) => U): (r: T) => Promise<U extends void ? T : Awaited<U>> {
  // @ts-expect-error force
  return (r) => new Promise((resolve) => setTimeout(() => resolve(fn(r) ?? r), 0))
}
