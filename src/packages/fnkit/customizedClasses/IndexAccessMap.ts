/**
 * faster find with cache
 * it's inner use JS Map
 */

export class IndexAccessMap<V extends object, BK extends keyof V> {
  // get faster access
  #keyIndexAccessMap: {
    [K in keyof V]?: WeakMap<any, V[BK]>;
  } = {};
  #basicKeyIndexAccessMap: BK;
  #innerMap: Map<V[BK], V>;

  static fromJSMap<V extends object, BK extends keyof V>(
    basicKeyPropertyName: BK,
    jsMap: Map<V[BK], V>
  ): IndexAccessMap<V, BK> {
    const indexAccessMap = new IndexAccessMap<V, BK>(basicKeyPropertyName);
    indexAccessMap.#innerMap = jsMap;
    return indexAccessMap;
  }

  constructor(basicKeyPropertyName: BK, iterable?: Iterable<V>) {
    // @ts-ignore
    this.#innerMap = new Map(
      iterable && basicKeyPropertyName ? [...iterable].map((i) => [i[basicKeyPropertyName], i]) : undefined
    );
    this.#basicKeyIndexAccessMap = basicKeyPropertyName;
  }

  get<K extends keyof V>(key: V[K], keyName?: K) {
    if (!keyName)
      return this.#innerMap.get(key as unknown as V[BK]);
    // @ts-ignore
    if (keyName !== this.#basicKeyIndexAccessMap) {
      const targetIndexAccessMap = this.#keyIndexAccessMap[keyName] ||
        (() => {
          const newAccessMap = new WeakMap<any, V[BK]>(
            [...this.#innerMap.values()].map((v) => [v[keyName], v[this.#basicKeyIndexAccessMap]])
          );
          this.#keyIndexAccessMap[keyName] = newAccessMap;
          return newAccessMap;
        })();
      const targetBasicKey = targetIndexAccessMap.get(key);
      return targetBasicKey && this.#innerMap.get(targetBasicKey);
    }
  }

  set(value: V) {
    const sourceBasicKey = value[this.#basicKeyIndexAccessMap];
    this.#innerMap.set(sourceBasicKey, value);
    for (const indexAccessKey in this.#keyIndexAccessMap) {
      this.#keyIndexAccessMap[indexAccessKey]?.set(value[indexAccessKey], sourceBasicKey);
    }
  }

  delete(key: V[BK]) {
    const value = this.#innerMap.get(key);
    if (!value)
      return false;
    this.#innerMap.delete(key);
    for (const indexAccessKey in this.#keyIndexAccessMap) {
      // @ts-ignore
      this.#keyIndexAccessMap[indexAccessKey].delete(value[indexAccessKey]);
    }
    return true;
  }

  has(key: V[BK]) {
    return this.#innerMap.has(key);
  }

  get size() {
    return this.#innerMap.size;
  }

  clear() {
    this.#innerMap.clear();
    for (const indexAccessKey in this.#keyIndexAccessMap) {
      // @ts-ignore
      this.#keyIndexAccessMap[indexAccessKey].clear();
    }
  }

  toJSMap() {
    return this.#innerMap;
  }
}
