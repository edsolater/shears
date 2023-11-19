import { cloneObject, isArray, isObject, isObjectLike, isObjectLiteral, switchCase } from '@edsolater/fnkit'

/**
 * array and objectLiteral will be wrapped to deeper
 * 
 * when it'not leaf, and not objectLiteral or array, it will just returned directly
 * @param target must be objectLiteral
 * @param wrapFn
 * @returns
 * @todo move to fnkit . use proxy to fasten
 */
export function wrapObjLeaves<Result = any>(
  target: any,
  /* leaf will not be array or objectLiteral */
  wrapFn: (leaf: any) => any,
  targetIsLeaf: (node: any) => boolean = (node) => !isArray(node) && !isObjectLiteral(node),
): Result {
  const cache = cloneObject(target)
  const setCache = (wrappedValue: any) => {
    Object.entries(wrappedValue).forEach(([key, value]) => {
      cache[key] = value
    })
  }
  return _wrapToDeep(target, wrapFn, targetIsLeaf, cache, setCache)
}

/** a data structure to store value */
type WrappedLeaf = {
  _isWrappedLeaf: true
  value: any
}
function isWrappedLeaf(v: any): v is WrappedLeaf {
  return isObject(v) && v._isWrappedLeaf
}
function makeWrappedLeaf(v: any): WrappedLeaf {
  return { _isWrappedLeaf: true, value: v }
}
function pickValueFromWrappedLeaf(v: any): any {
  return isWrappedLeaf(v) ? v.value : v
}

/**
 * only used in {@link wrapObjLeaves}
 * @param target any type
 * @param wrapFn
 * @returns
 * @todo move to fnkit . use proxy to fasten
 */
function _wrapToDeep<Result = any>(
  target: any,
  /* leaf will not be array or objectLiteral */
  wrapFn: (leaf: any) => any,
  targetIsLeaf: (node: any) => boolean = (node) => !isArray(node) && !isObjectLiteral(node),
  cacheFragnement: any,
  cacheSetter: (wrappedValue: any) => void,
): Result {
  return switchCase(
    target,
    [
      [
        targetIsLeaf,
        (target) =>
          isWrappedLeaf(cacheFragnement)
            ? pickValueFromWrappedLeaf(cacheFragnement)
            : pipeDo(wrapFn(target), makeWrappedLeaf, cacheSetter, pickValueFromWrappedLeaf),
      ],
      [
        isObjectLike,
        (target) =>
          new Proxy(target, {
            get: (target, key) =>
              _wrapToDeep(target[key], wrapFn, targetIsLeaf, cacheFragnement[key], (propertyValue) => {
                Reflect.set(cacheFragnement, key, propertyValue)
              }),
          }),
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
function pipeDo<T>(v: T, ...handlers: ((v: T) => undefined | any)[]): any {
  return handlers.reduce((v, handler) => handler(v) ?? v, v)
}

/**
 * FP utils : IIFE
 */
function iife(fn: () => void) {
  fn()
}
