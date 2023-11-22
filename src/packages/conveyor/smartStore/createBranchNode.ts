import { WeakerMap, WeakerSet, hasProperty } from '@edsolater/fnkit'
import { Subscribable, createSubscribable } from '../subscribable/core'
import { TaskExecutor } from './createTask'

export const branchNodeID = Symbol('branchNodeTag')
export const isLeafTag = Symbol('LeafTag')
export const leafOptionTag = Symbol('leafOptionTag')

type BranchNodeID = string

/**
 * add ability to pure subscribable
 */
export interface BranchNode<T = any> {
  // when set this, means this object is a observable-subscribable
  [branchNodeID]: BranchNodeID
  parent?: BranchNode<any>
  // pure value
  rawValue: T
  value: Subscribable<T>
  /**
   * used by TaskExecutor to track subscribable's visiability
   *
   * only effect exector will auto run if it's any observed Leaf is visiable \
   * visiable, so effect is meaningful 0for user
   */
  visiable: Subscribable<boolean>
  subscribedTaskExecutors: WeakerSet<TaskExecutor>
  // you can go deeper, by accessing this property
  children: any
}

export interface LeafNode<T> extends Omit<BranchNode<T>, 'childNodes'> {}

let systemBranchID = 0
/** used in {{@link createBranchNode}} */
const branchNodesCache = new WeakerMap<BranchNodeID, BranchNode>()
function generateBranchNodeID() {
  return `branchNode_${systemBranchID++}`
}

/** create empty branch node, mutate is by other functions */
export function createBranchNode<T>(options?: {
  parent?: BranchNode
  getRaw?: () => T
  isLeaf?: boolean
  isVisiable?: boolean
  childNodes?: any
}) {
  const nodeID = generateBranchNodeID()
  const node = {
    [branchNodeID]: nodeID,
    parent: options?.parent,
    [isLeafTag]: false,
    get rawValue() {
      return options?.getRaw?.()
    },
    value: createSubscribable(options?.getRaw),
    visiable: createSubscribable(options?.isVisiable),
    subscribedTaskExecutors: new WeakerSet(),
    get children() {
      return options?.childNodes?.()
    },
  } as BranchNode<T>
  branchNodesCache.set(nodeID, node)
  return node
}

export function getBranchNodeByCacheId(id: BranchNodeID) {
  return branchNodesCache.get(id)
}

/** just a preset of {@link createBranchNode} */
export function createEmptyBranchNode() {
  return createBranchNode({})
}

export function createEmptyInfinitBranchTree(
  parentNodesIDs?: BranchNodeID[],
  cacheBranchNodes = new WeakerMap<BranchNodeID, BranchNode>(),
): BranchNodeTree<undefined> {
  const treeRootNode = new Proxy({} as any, {
    get(target, key) {
      if (cacheBranchNodes.has(key)) return cacheBranchNodes.get(key)
      return createBranchNode()
    },
  })
}

interface BranchNodeTree<O extends object> extends BranchNode<O> {
  children: {
    [K in keyof O]: O[K] extends object ? BranchNodeTree<O[K]> : BranchNode<O[K]>
  }
}

/** replace Branch node  */
export function createBranchNodeTree<O extends object>(raw?: O): BranchNodeTree<O> {
  throw 'TODO'
}

/**
 * judge whether value is a branchNode
 * @param value to be checked
 * @returns whether
 */
export function isBranchNode<T>(value: any): value is BranchNode<T> {
  return value?.[branchNodeID]
}

/**
 * judge whether value is a leafNode
 * @param value to be checked
 * @returns whether
 */
export function isLeafNode<T>(value: any): value is LeafNode<T> {
  return Boolean(value?.['childNodes'])
}
