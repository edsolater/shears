import { isArray, isObjectLike, isObjectLiteral } from "@edsolater/fnkit"

let keyIdCount = 1
const keyIdGen = () => String(keyIdCount++)
const generatedKeyMap = new WeakMap<any, string>()

// TODO: move to fnkit
export function toStringKey(value: unknown): string {
  if (!isObjectLike(value)) {
    return String(value)
  } else if (isObjectLike(value)) {
    if (generatedKeyMap.has(value)) {
      return generatedKeyMap.get(value)!
    } else {
      if (isArray(value)) {
        const key = String(value.map(toStringKey))
        generatedKeyMap.set(value, key)
        return key
      } else if (isObjectLiteral(value)) {
        const key = Object.entries(value)
          .map(([k, v]) => `${k}:${toStringKey(v)}`)
          .join(",")
        generatedKeyMap.set(value, key)
        return key
      } else {
        const key = keyIdGen()
        generatedKeyMap.set(value, key)
        return key
      }
    }
  } else {
    return ""
  }
}
