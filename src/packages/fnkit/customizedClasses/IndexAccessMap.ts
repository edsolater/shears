/**
 * faster find with cache
 * it's inner use JS Map
 */

export class IndexAccessMap<V extends object, BK extends keyof V> {
  // get faster access
  #keyIndexAccessMap: {
    [K in keyof V]?: Map<any, V[BK]>
  } = {}
  #basicKeyIndexAccessMap: BK
  #innerMap: Map<V[BK], V>

  static fromJSMap<V extends object, BK extends keyof V>(
    basicKeyPropertyName: BK,
    jsMap: Map<V[BK], V>
  ): IndexAccessMap<V, BK> {
    const indexAccessMap = new IndexAccessMap<V, BK>(basicKeyPropertyName)
    indexAccessMap.#innerMap = jsMap
    return indexAccessMap
  }

  constructor(basicKeyPropertyName: BK, iterable?: Iterable<V>) {
    // @ts-ignore
    this.#innerMap = new Map(
      iterable && basicKeyPropertyName ? [...iterable].map((i) => [i[basicKeyPropertyName], i]) : undefined
    )
    this.#basicKeyIndexAccessMap = basicKeyPropertyName
  }

  select<K extends keyof V>(key: V[K], keyPropertyName: K) {
    if (!keyPropertyName) return this.get(key)
    // @ts-ignore
    if (keyPropertyName !== this.#basicKeyIndexAccessMap) {
      const targetIndexAccessMap =
        this.#keyIndexAccessMap[keyPropertyName] ||
        (() => {
          const newAccessMap = new Map<any, V[BK]>(
            [...this.#innerMap.values()].map((v) => [v[keyPropertyName], v[this.#basicKeyIndexAccessMap]])
          )
          this.#keyIndexAccessMap[keyPropertyName] = newAccessMap
          return newAccessMap
        })()
      const targetBasicKey = targetIndexAccessMap.get(key)
      return targetBasicKey && this.#innerMap.get(targetBasicKey)
    }
  }
  
  get<K extends keyof V>(key: V[K]) {
    return this.#innerMap.get(key as unknown as V[BK])
  }

  set(value: V) {
    const sourceBasicKey = value[this.#basicKeyIndexAccessMap]
    this.#innerMap.set(sourceBasicKey, value)
    for (const indexAccessKey in this.#keyIndexAccessMap) {
      this.#keyIndexAccessMap[indexAccessKey]?.set(value[indexAccessKey], sourceBasicKey)
    }
  }

  delete(key: V[BK]) {
    const value = this.#innerMap.get(key)
    if (!value) return false
    this.#innerMap.delete(key)
    for (const indexAccessKey in this.#keyIndexAccessMap) {
      // @ts-ignore
      this.#keyIndexAccessMap[indexAccessKey].delete(value[indexAccessKey])
    }
    return true
  }

  has(key: V[BK]) {
    return this.#innerMap.has(key)
  }

  get size() {
    return this.#innerMap.size
  }

  clear() {
    this.#innerMap.clear()
    for (const indexAccessKey in this.#keyIndexAccessMap) {
      // @ts-ignore
      this.#keyIndexAccessMap[indexAccessKey].clear()
    }
  }

  toJSMap() {
    return this.#innerMap
  }
}
