import { isObjectLike } from '@edsolater/fnkit'

/** shortcut of multi Reflect.set
 * @example
 * const obj = {b: 1}
 * const patcher = {a: 2, c: 'hello'}
 * const c = assignObject(obj, patcher) //=> {b: 1, a: 2, c: 'hello'}
 */
export function assignObject(obj: object, propertyPairs: object, onAssign?: (key: keyof any, value: any) => void) {
  Reflect.ownKeys(propertyPairs).forEach((key) => {
    Object.defineProperty(obj, key, Object.getOwnPropertyDescriptor(propertyPairs, key)!)
  })
}

//TODO: move to fnkit
function forEachObjectEntries<T extends object>(obj: T, handler: (entry: [keyof T, T[keyof T]]) => void) {
  Reflect.ownKeys(obj).forEach((key) => {
    handler([key as keyof T, obj[key as keyof T]])
  })
}

// function forEachObjectDescriptor<T extends object>(obj: T, handler: (entry: [keyof T, ]) => void) {
//   Reflect.ownKeys(obj).forEach((key) => {
//     handler([key as keyof T, Object.getOwnPropertyDescriptor(obj, key)!])
//   })
// }

// function recursivelyAssignObject(obj: object, propertyPairs: object, onAssign?: (key: keyof any, value:any, ) => void) {
//   forEachObjectEntries(propertyPairs, ([key, value]) => {
//     if (isObjectLike(value)) {
//       recursivelyAssignObject(obj[key], value)
//     } else {
//       assignObject(obj, { [key]: value })
//     }
//   })
// }

// function recursively
