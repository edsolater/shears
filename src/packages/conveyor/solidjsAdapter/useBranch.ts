import { InfinityObjNode } from '../../fnkit/createInfinityObj'
import { Shuck } from '../smartStore/shuck'
import { useShuck } from './useShuck'

/** turn shuck into signal  */
export function useBranch<T>(branchNode: InfinityObjNode<Shuck<T>>) {
  return useShuck(branchNode())
}
