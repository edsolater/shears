import { isObject } from '@edsolater/fnkit'
import { parseShallowKeyFromKeyArray } from './parseShallowKeyFromKeyArray'

type UserAttachedValue = any
type InfiniteObjNode = {
  [currentPathFromRoot]: (keyof any)[]
  [attachedValue]?: UserAttachedValue
}
const currentPathFromRoot = Symbol('currentPathFromRoot')
const attachedValue = Symbol('attachedValue')

const loadSelf = Symbol('load')
/**
 * core part of createFakeTree, it's a common utils, no need to use it directly
 */
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

export function isInfiniteNodeEmpty(value: any): value is InfiniteObjNode {
  return isInfiniteNode(value) && value[attachedValue] === undefined
}


export function isInfiniteNode(value: any): value is InfiniteObjNode {
  return isObject(value) && currentPathFromRoot in value
}

export function isInfiniteNodeLoaded(value: any): value is InfiniteObjNode {
  return isInfiniteNode(value) && value[attachedValue] !== undefined
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
