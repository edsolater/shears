import { isIterable, isMap, isUndefined } from '@edsolater/fnkit';

/** accept all may iterable data type */
export function toItems<T>(i?: Map<any, T> | Set<T> | T[] | Record<keyof any, T> | Iterable<T>) {
  return isUndefined(i) ? [] : isMap(i) ? Array.from(i.values()) : isIterable(i) ? Array.from(i) : Object.values(i);
}
