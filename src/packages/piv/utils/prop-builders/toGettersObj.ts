/**
 * note: !!! this use proxy, so **if not specified propertyKeys, it will not work with object destruction**
 * @param getAccessorOfObj accessor of object that will be used to get the value of the property
 * @returns
 */

export function toGettersObj<T extends object>(getAccessorOfObj: () => T, objKeys?: (keyof T)[]): T {
  const tempObj = objKeys ? Object.fromEntries(objKeys.map((key) => [key, undefined])) : {};
  let obj: T | undefined = undefined;
  return new Proxy(tempObj, {
    get: (target, p, receiver) => {
      if (!obj) {
        obj = getAccessorOfObj();
      }
      return Reflect.get(obj, p, receiver);
    }
  }) as T;
}
