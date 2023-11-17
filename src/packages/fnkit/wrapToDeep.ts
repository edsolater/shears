import { isArray, isObjectLiteral } from '@edsolater/fnkit'

/**
 * array and objectLiteral will be wrapped to deeper
 * @param target any type
 * @param wrapFn
 * @returns
 * @todo move to fnkit . use proxy to fasten
 */
export function wrapToDeep<Result = any>(
  target: any,
  /* leaf will not be array or objectLiteral */
  wrapFn: (leaf: any) => any,
  detectLeaf: (node: any) => boolean = (node) => !isArray(node) && !isObjectLiteral(node) ,
): Result {
  
  if (detectLeaf(target)) return wrapFn(target)
  // @ts-ignore
  if (isArray(target)) return target.map((t) => wrapToDeep(t, wrapFn, detectLeaf))
  if (isObjectLiteral(target))
    // @ts-ignore
    return Object.fromEntries(
      Object.entries(target).map(([key, value]) => [key, wrapToDeep(value, wrapFn, detectLeaf)]),
    )
  return target
}
