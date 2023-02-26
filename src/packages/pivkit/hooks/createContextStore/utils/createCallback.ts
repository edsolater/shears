import { OnChangeCallback, OnFirstAccessCallback } from '../type'

/**
 * for better type
 */
export function createOnFirstAccessCallback<T extends Record<string, any>, K extends keyof T = keyof T>(
  propertyName: K,
  cb: OnFirstAccessCallback<T, K>
): { propertyName: keyof T; cb: OnFirstAccessCallback<T, keyof T> } {
  return { propertyName, cb: cb as any/*  no need to check type here */ }
}

export function createOnChangeCallback<T extends Record<string, any>, K extends keyof T = keyof T>(
  propertyName: K,
  cb: OnChangeCallback<T, K>
) {
  return { propertyName, cb }
}
