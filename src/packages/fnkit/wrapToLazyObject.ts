/** it use proxy to lazy load info */
export function wrapToLazyObject<T extends object>(getObj: () => T): T {
  let resolvedBN: T | undefined = undefined
  return new Proxy({} as any, {
    get(_, prop, receiver) {
      resolvedBN = resolvedBN || getObj()
      return Reflect.get(resolvedBN, prop, receiver)
    }
  })
}