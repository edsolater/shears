import { InfinityObjNode } from '../../fnkit/createInfinityObj'
import { Shuck, setShuckVisiable } from '../smartStore/createShuck'
import { useShuck } from './useShuck'

/** turn shuck into signal  */
export function useBranchNode<T>(branchNode: InfinityObjNode<Shuck<T>>) {
  const shuck = branchNode()
  return useShuck(shuck)
}


