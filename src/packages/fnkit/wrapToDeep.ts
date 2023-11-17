import { isArray, isObjectLike, isObjectLiteral, switchCase } from '@edsolater/fnkit'

/**
 * array and objectLiteral will be wrapped to deeper
 * @param target must be objectLiteral
 * @param wrapFn
 * @returns
 * @todo move to fnkit . use proxy to fasten
 */
export function wrapToDeep<Result = any>(
  target: any,
  /* leaf will not be array or objectLiteral */
  wrapFn: (leaf: any) => any,
  detectLeaf: (node: any) => boolean = (node) => !isArray(node) && !isObjectLiteral(node),
): Result {
  const cache = {}
  const setCache = (wrappedValue: any) => {
    Object.entries(wrappedValue).forEach(([key, value]) => {
      cache[key] = value
    })
  }
  return _wrapToDeep(target, wrapFn, detectLeaf, cache, setCache)
}

/**
 * only used in {@link wrapToDeep}
 * @param target any type
 * @param wrapFn
 * @returns
 * @todo move to fnkit . use proxy to fasten
 */
function _wrapToDeep<Result = any>(
  target: any,
  /* leaf will not be array or objectLiteral */
  wrapFn: (leaf: any) => any,
  detectLeaf: (node: any) => boolean = (node) => !isArray(node) && !isObjectLiteral(node),
  cacheObject: object,
  cacheSetter: (wrappedValue: any) => void,
): Result {
  return switchCase(
    target,
    [
      [detectLeaf, (t) => parallelHandles(wrapFn(t), cacheSetter)],
      [
        isObjectLike,
        (t) =>
          new Proxy(target, {
            get: (target, key) =>
              _wrapToDeep(target[key], wrapFn, detectLeaf, cacheObject, (propertyValue) => {
                Reflect.set(cacheObject, key, propertyValue)
              }),
          }) as any,
      ],
    ],
    target,
  )
}

/**
 * FP utils : give opportunity to handle/change value in parallel
 *
 * always return v
 *
 * @param v input value
 * @param handlers opportunity to change value or just do something
 * @returns handled v / original v (depend on handlers)
 * @todo already have move to fnkit
 */
function parallelHandles<T>(v: T, ...handlers: ((v: T) => undefined | T)[]): T {
  handlers.reduce((v, handler) => handler(v) ?? v, v)
  return v
}
