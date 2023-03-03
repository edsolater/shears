import { OnFirstAccessCallback } from '../type'

/**
 * for better type
 */
export function createOnFirstAccessCallback<T extends Record<string, any>>(
  propertyName: keyof T,
  cb: OnFirstAccessCallback<T>
): { propertyName: keyof T; cb: OnFirstAccessCallback<T> } {
  return { propertyName, cb: cb as any /*  no need to check type here */ }
}

