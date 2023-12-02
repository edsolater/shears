import { MayFn, Primitive, isObject, shrinkFn } from '@edsolater/fnkit'
import { parseShallowKeyFromKeyArray } from './parseShallowKeyFromKeyArray'

type UserAttachedValue = any
export type InfiniteObjNode<V extends UserAttachedValue = any> = {
  (): V
  [currentPathFromRoot]: (keyof any)[]
  [loadSelf]: (value: MayFn<V, [oldValue: V]>) => void
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
function createInfinityNode<T>(paths: (keyof any)[] = [], value?: T) {
  let nodeValue = value
  return Object.assign(() => nodeValue, {
    [currentPathFromRoot]: paths,
    [loadSelf]: (value: MayFn<T, [oldValue: T | undefined]>) => {
      const newValue = shrinkFn(value, [nodeValue])
      nodeValue = newValue
    },
  })
}

export function isInfiniteNode(value: any): value is InfiniteObjNode {
  return isObject(value) && currentPathFromRoot in value
}

export function loadInfiniteObjNode<T>(node: InfiniteObjNode<T>, value: MayFn<T, [oldValue: T | undefined]>) {
  node[loadSelf](value)
}
