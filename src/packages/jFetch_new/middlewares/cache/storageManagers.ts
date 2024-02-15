interface StoreManager<V = unknown> {
  set: (key: string, body: V) => Promise<void>
  get: (key: string) => Promise<V | undefined>
  has: (key: string) => Promise<boolean>
  delete: (key: string) => Promise<void>
}

export function createLocalStorageStoreManager<T = unknown>(): StoreManager<T> {
  async function set(key: string, body: unknown) {
    globalThis.localStorage.setItem(key, JSON.stringify(body))
  }
  async function get(key: string) {
    const content = globalThis.localStorage.getItem(key)
    if (content) {
      return JSON.parse(globalThis.localStorage.getItem(key)!)
    }
    return undefined
  }
  async function deleteItem(key: string) {
    globalThis.localStorage.removeItem(key)
  }
  async function has(key: string) {
    return globalThis.localStorage.getItem(key) != null
  }
  return {
    set,
    get,
    delete: deleteItem,
    has,
  }
}

export function createSessionStorageStoreManager<T = unknown>(): StoreManager<T> {
  async function set(key: string, body: unknown) {
    globalThis.sessionStorage.setItem(key, JSON.stringify(body))
  }
  async function get(key: string) {
    const content = globalThis.sessionStorage.getItem(key)
    if (content) {
      return JSON.parse(globalThis.sessionStorage.getItem(key)!)
    }
    return undefined
  }
  async function deleteItem(key: string) {
    globalThis.sessionStorage.removeItem(key)
  }
  async function has(key: string) {
    return globalThis.sessionStorage.getItem(key) != null
  }
  return {
    set,
    get,
    delete: deleteItem,
    has,
  }
}
export function createIndexedDBStoreManager<T = unknown>(
  dbName: string,
  storeName: string,
  version = 1,
): StoreManager<T> {
  const request = globalThis.indexedDB.open(dbName, version)

  let resolve: (value: IDBDatabase) => void
  let reject: (reason?: any) => void
  const db = new Promise<IDBDatabase>((innerResolve, innerReject) => {
    resolve = innerResolve
    reject = innerReject
  })
  request.onerror = (event) => {
    reject((event.target as IDBOpenDBRequest).error)
  }
  request.onblocked = (event) => {
    reject((event.target as IDBOpenDBRequest).error)
  }
  request.onupgradeneeded = (event) => {
    const _db = (event.target as IDBOpenDBRequest).result
    resolve(_db)
    _db.createObjectStore(storeName)
  }
  request.onsuccess = (event) => {
    const _db = (event.target as IDBOpenDBRequest).result
    resolve(_db)
  }

  async function set(key: string, body: unknown) {
    db.then((db) => {
      const transaction = db.transaction(storeName, 'readwrite')
      transaction.objectStore(storeName).put(body, key)
    }).catch((e) => {
      console.error(e)
    })
  }
  async function get(key: string) {
    return db
      .then((db) => {
        let resolve: (value: T) => void
        let reject: (reason?: any) => void
        const result = new Promise<T>((innerResolve, innerReject) => {
          resolve = innerResolve
          reject = innerReject
        })
        const transaction = db.transaction(storeName, 'readonly')
        const request = transaction.objectStore(storeName).get(key)
        request.addEventListener('success', (event) => {
          resolve((event.target as IDBRequest).result)
        })
        request.addEventListener('error', (event) => {
          reject((event.target as IDBRequest).error)
        })
        return result
      })
      .catch((e) => {
        console.error(e)
        return undefined
      })
  }
  async function deleteItem(key: string) {
    db.then((db) => {
      const transaction = db.transaction(storeName, 'readwrite')
      transaction.objectStore(storeName).delete(key)
    }).catch((e) => {
      console.error(e)
      return undefined
    })
  }
  async function has(key: string) {
    const v = await get(key)
    return v != null
  }
  return {
    set,
    get,
    delete: deleteItem,
    has,
  }
}
export function createMemoryStoreManager<T>(): StoreManager<T> {
  const store = new Map<string, unknown>()
  async function set(key: string, body: unknown) {
    store.set(key, body)
  }
  async function get(key: string) {
    return store.get(key) as T | undefined
  }
  async function deleteItem(key: string) {
    store.delete(key)
  }
  async function has(key: string) {
    return store.has(key)
  }
  return {
    set,
    get,
    delete: deleteItem,
    has,
  }
}
