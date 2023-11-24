/**
 *
 * type key array: (keyof any)[] into an string
 * @todo into a symbol
 * @todo should accept object also , not just string | number | symbol
 *
 * @example
 * parseShallowKeyFromArray([2, 3, 4]) === parseShallowKeyFromArray([2, 3, 4])
 *
 */
export function parseShallowKeyFromKeyArray(shallowKey: (keyof any)[]) {
  return shallowKey.map((v) => String(v)).join(', ')
}
