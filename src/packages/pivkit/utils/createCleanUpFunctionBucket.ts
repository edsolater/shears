import { AnyFn } from '@edsolater/fnkit'

/**
 * Creates a bucket for storing cleanup functions.
 * @returns An object with two methods: `add` to add a cleanup function to the bucket, and `invokeStoredAndClear` to invoke all stored cleanup functions and clear the bucket.
 */
export function createCleanUpFunctionBucket() {
  const cleanUps: AnyFn[] = []
  return {
    add(cleanFn: AnyFn) {
      cleanUps.push(cleanFn)
    },
    invokeStoredAndClear() {
      cleanUps.forEach((cleanFn) => cleanFn())
      cleanUps.length = 0
    },
  }
}
