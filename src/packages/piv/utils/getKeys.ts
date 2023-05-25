import { unifyItem } from '@edsolater/fnkit'

export function getKeys<T extends object | undefined>(objs: T[]) {
  return unifyItem(
    objs.flatMap((obj) => {
      if (!obj) return []
      const descriptors = Object.getOwnPropertyDescriptors(obj) // 🤔 necessary?
      return Reflect.ownKeys(descriptors)
    })
  )
}
