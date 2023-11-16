import { isArray, isObjectLiteral } from '@edsolater/fnkit';

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
  wrapFn: (leaf: any) => any
): Result {
  // @ts-expect-error type here is useless
  if (isArray(target)) return target.map(wrapItems);
  if (isObjectLiteral(target))
    // @ts-expect-error type here is useless
    return Object.fromEntries(Object.entries(target).map(([key, value]) => [key, wrapItems(value)]));
  return wrapFn(target);
}
