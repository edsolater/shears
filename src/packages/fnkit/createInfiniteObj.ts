import { isObject } from '@edsolater/fnkit'
import { parseShallowKeyFromKeyArray } from './parseShallowKeyFromKeyArray'

type UserAttachedValue = any
type InfiniteObjNode = {
  [currentPathFromRoot]: (keyof any)[]
}
const currentPathFromRoot = Symbol('currentPathFromRoot')

const loadSelf = Symbol('load')
export function createInfiniteObj(
  currentKeyPath: (keyof any)[] = [],
  attachedValueMap = new Map<keyof any, UserAttachedValue>(),
) {
  const pathCollector = new Proxy(
    {
      [currentPathFromRoot]: currentKeyPath,
      /** TODO */
      [loadSelf]: (nodeValue: any) => {},
    },
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

export function isInfiniteObjNodeUnloaded(value: any): value is InfiniteObjNode {
  return isObject(value) && currentPathFromRoot in value
}

export function loadInfiniteObjNode(node: InfiniteObjNode, value) {
  const { [currentPathFromRoot]: keyPath } = node
  const attachedValueMap = new Map<keyof any, UserAttachedValue>()
  const pathCollector = new Proxy(
    { [currentPathFromRoot]: keyPath },
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
