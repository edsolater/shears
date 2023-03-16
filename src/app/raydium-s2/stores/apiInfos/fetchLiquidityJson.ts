import { mapEntry } from '@edsolater/fnkit'
import { jFetch } from '../../../../packages/jFetch'
import { LiquidityJson, LiquidityJsonFile } from './liquidtyInfoType'

/**
 * <span style="color:blue">some *blue* text</span>.
 */
export async function fetchLiquidityJson(options: { url: string }): Promise<Map<string, LiquidityJson> | undefined> {
  const response = await jFetch<LiquidityJsonFile>(options.url, { cacheFreshTime: 5 * 60 * 1000 })
  if (!response) return undefined
  const liquidityInfoList = [...(response?.official ?? []), ...(response?.unOfficial ?? [])]
  return new Map(liquidityInfoList.map((info) => [info.id, info] as const))
}

// type BasicKey<V extends object> = keyof V

// /** faster find with cache */
// class ItemMap<V extends object, BK extends BasicKey<V>> extends Map<any, V> {
//   // get faster access
//   #keyIndexAccessMap: {
//     [K in keyof V]?: WeakMap<any, BK>
//   } = {}
//   #basicKeyIndexAccessMap: BK | undefined

//   constructor()
//   constructor(iterable: Iterable<V>, keyName: BK)
//   constructor(iterable?: Iterable<V>, keyName?: BK) {
//     // @ts-ignore
//     super(iterable && keyName ? [...iterable].map((i) => [i[keyName], i]) : undefined)
//     this.#basicKeyIndexAccessMap = keyName
//   }
//   override get<T extends keyof V>(key: V[T], keyName?: T) {
//     if (!keyName) return super.get(key)
//     // @ts-ignore
//     if (keyName !== this.#basicKeyIndexAccessMap) {
//       const targetIndexAccessMap =
//         this.#keyIndexAccessMap[keyName] ||
//         (() => {
//           const newAccessMap = new WeakMap<any, BK>(
//             // @ts-ignore
//             [...super.values()].map((v) => [v[keyName], v[this.#basicKeyIndexAccessMap!]])
//           )
//           this.#keyIndexAccessMap[keyName] = newAccessMap
//           return newAccessMap
//         })()
//       const targetBasicKey = targetIndexAccessMap.get(key)
//       return super.get(targetBasicKey)
//     }
//   }
//   override set<T extends keyof V>(key: V[T], value: V, keyName?: T) {

// }
