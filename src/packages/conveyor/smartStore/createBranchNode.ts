import { WeakerSet } from '@edsolater/fnkit'
import { Subscribable, createSubscribable } from '../subscribable/core'
import { TaskExecutor } from './createTask'

export const branchNodeTag = Symbol('branchNodeTag')
export const isLeafTag = Symbol('LeafTag')
export const leafOptionTag = Symbol('leafOptionTag')

/**
 * add ability to pure subscribable
 */
export interface BranchNode<T> {
  // when set this, means this object is a observable-subscribable
  [branchNodeTag]: boolean
  // when true means can't dive deeper, for it's leaf
  [isLeafTag]: boolean
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
  port: any
}

export interface LeafNode<T> extends BranchNode<T> {
  [isLeafTag]: true
}

/** create empty branch node, mutate is by other functions */
export function createBranchNode<T>(options: { getRaw?: () => T; isLeaf?: boolean; isVisiable?: boolean }) {
  return {
    [branchNodeTag]: true,
    [isLeafTag]: false,
    get rawValue() {
      return options.getRaw?.()
    },
    value: createSubscribable(options.getRaw),
    visiable: createSubscribable(options.isVisiable),
    subscribedTaskExecutors: new WeakerSet(),
    get port() {
      return options.getRaw?.()
    },
  } as BranchNode<T>
}

interface BranchNodeTree<O extends object> extends BranchNode<O> {
  port: {
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
  return value?.[branchNodeTag]
}

/**
 * judge whether value is a leafNode
 * @param value to be checked
 * @returns whether
 */
export function isLeafNode<T>(value: any): value is LeafNode<T> {
  return value?.[isLeafTag]
}

/**
 * branchNode => leafNode
 */
export function tagBranchNodeAsLeaf<T>(branchNode: BranchNode<T>) {
  branchNode[isLeafTag] = true
}
