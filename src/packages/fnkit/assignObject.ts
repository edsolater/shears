import { isObjectLike } from '@edsolater/fnkit'

/** shortcut of multi Reflect.set
 * @example
 * const obj = {b: 1}
 * const patcher = {a: 2, c: 'hello'}
 * const c = assignObject(obj, patcher) //=> {b: 1, a: 2, c: 'hello'}
 */
export function assignObject<T extends object>(obj: T, propertyPairs: object): T {
  assignObjectWithConfigs(obj, propertyPairs, simpleObectAssign)
  return obj
}

type AttachFn = (payloads: {
  key: keyof any
  /** this maybe not obj */
  obj: object
  originalValue: any
  patchValue: any
}) => void

const simpleObectAssign = ({
  obj,
  key,
  patchValue,
}: {
  key: keyof any
  /** this maybe not obj */
  obj: object
  originalValue: any
  patchValue: any
}): object =>
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    writable: true,
    value: patchValue,
  })

/**
 * @todo move to fnkit
 * will not change the original object
 * @param originalObject
 * @param patchObject
 * @param attachRule
 * @returns void
 */
export function assignObjectWithConfigs<T extends object>(
  originalObject: T,
  patchObject: Partial<T>,
  attachRule?: AttachFn,
): T
export function assignObjectWithConfigs<T extends object>(
  originalObject: T,
  patchObject: object,
  attachRule?: AttachFn,
): T
export function assignObjectWithConfigs<T extends object>(
  originalObject: T,
  patchObject: Partial<T>,
  attachRule: AttachFn = simpleObectAssign,
): T {
  Reflect.ownKeys(patchObject).forEach((key) => {
    const originalValue = Reflect.get(originalObject, key)
    const patchValue = Reflect.get(patchObject, key)
    if (isObjectLike(originalValue) && isObjectLike(patchValue)) {
      assignObjectWithConfigs(originalValue, patchValue, attachRule)
    } else {
      attachRule({ key, obj: originalObject, originalValue, patchValue })
    }
  })
  return originalObject
}
