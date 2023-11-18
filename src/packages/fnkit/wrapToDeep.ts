import { isArray, isObjectLike, isObjectLiteral, switchCase } from '@edsolater/fnkit'

/**
 * array and objectLiteral will be wrapped to deeper
 * @param target must be objectLiteral
 * @param wrapFn
 * @returns
 * @todo move to fnkit . use proxy to fasten
 */
export function wrapLeafNodes<Result = any>(
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
 * only used in {@link wrapLeafNodes}
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
  cache: object,
  cacheSetter: (wrappedValue: any) => void,
): Result {
  return switchCase(
    target,
    [
      [detectLeaf, (t) => cache /* already cached */ ?? parallelActions(wrapFn(t), cacheSetter) /* not cached */],
      [
        isObjectLike,
        (t) => {
          if (!cache) {
            return new Proxy(target, {
              get: (target, key) =>
                _wrapToDeep(target[key], wrapFn, detectLeaf, cache[key], (propertyValue) => {
                  Reflect.set(cache, key, propertyValue)
                }),
            }) as any
          } else {
            return cache   
          }
        },
      ],
    ],
    () => target,
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
function parallelActions<T>(v: T, ...handlers: ((v: T) => undefined | T)[]): T {
  handlers.reduce((v, handler) => handler(v) ?? v, v)
  return v
}
