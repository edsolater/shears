export function makeSignalToGetters<T extends object>(value: () => T): T {
  let solvedValue: T | undefined = undefined
  return new Proxy(
    {},
    {
      get(target, p, receiver) {
        if (!solvedValue) {
          solvedValue = value()
        }
        return Reflect.get(solvedValue, p, receiver)
      }
    }
  ) as T
}
