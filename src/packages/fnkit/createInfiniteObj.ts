import { parseShallowKeyFromKeyArray } from './parseShallowKeyFromKeyArray'

type UserAttachedValue = any
const currentPathFromRoot = Symbol('currentPathFromRoot')
export function createInfiniteObj(
  currentKeyPath: (keyof any)[] = [],
  attachedValueMap = new Map<keyof any, UserAttachedValue>(),
) {
  const pathCollector = new Proxy(
    { [currentPathFromRoot]: currentKeyPath },
    {
      set(target, key, value) {
        const shallowKey = parseShallowKeyFromKeyArray(target[currentPathFromRoot].concat(key))
        attachedValueMap.set(shallowKey, value)
        return true
      },
      get(target, key) {
        const shallowKey = parseShallowKeyFromKeyArray(target[currentPathFromRoot].concat(key))
        if (attachedValueMap.has(shallowKey)) return attachedValueMap.get(shallowKey)
        return createInfiniteObj(target[currentPathFromRoot].concat(key), attachedValueMap)
      },
    },
  )
  return pathCollector
}
