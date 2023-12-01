import { isObject } from '@edsolater/fnkit'
import { parseShallowKeyFromKeyArray } from './parseShallowKeyFromKeyArray'

type UserAttachedValue = any
type InfiniteObjNode<V extends UserAttachedValue = any> = {
  (): V
  [currentPathFromRoot]: (keyof any)[]
  [loadSelf]: (value: V) => void
}
const currentPathFromRoot = Symbol('currentPathFromRoot')

const loadSelf = Symbol('load')

/**
 * core part of createFakeTree, it's a common utils, no need to use it directly
 * can get more through this node
 */
export function createTreeableInfinityNode(
  currentKeyPath: (keyof any)[] = [],
  attachedValueMap = new Map<keyof any, UserAttachedValue>(),
  value?: any,
) {
  const pathCollector = new Proxy(createInfinityNode(currentKeyPath, value), {
    get(target, key) {
      if (key in target) return Reflect.get(target, key)
      const paths = target[currentPathFromRoot].concat(key)
      const flatedKey = parseShallowKeyFromKeyArray(paths)
      if (attachedValueMap.has(flatedKey)) return attachedValueMap.get(flatedKey)
      else {
        const newInfiniteNode = createTreeableInfinityNode(paths, attachedValueMap)
        attachedValueMap.set(flatedKey, newInfiniteNode)
        return newInfiniteNode
      }
    },
  })
  return pathCollector
}

/**
 * can't get more through this node 
 */
function createInfinityNode(paths: (keyof any)[] = [], value?: any) {
  let nodeValue = value
  return Object.assign(() => nodeValue, {
    [currentPathFromRoot]: paths,
    [loadSelf]: (value: any) => {
      nodeValue = value
    },
  })
}

export function isInfiniteNode(value: any): value is InfiniteObjNode {
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
        return createTreeableInfinityNode(target[currentPathFromRoot].concat(key), attachedValueMap)
      },
    },
  )
  return pathCollector
}
