import { isCurrentDateAfter, type MayPromise } from '@edsolater/fnkit'
import { isResponse, type JFetchMiddlewareItem } from '../../jFetch'
import {
  createIndexedDBStoreManager,
  createLocalStorageStoreManager,
  createMemoryStoreManager,
  createSessionStorageStoreManager,
} from './storageManagers'

type ResourceUrl = string

export function cache(options: {
  /** if still within cache fresh time, use cache. */
  cacheFreshTime?: number // (s)
  cacheStorePlace?: 'jsMemory' | 'localStorage' | 'sessionStorage' | 'indexedDB'
}): JFetchMiddlewareItem {
  return async ({ url }, next) => {
    const { cacheFreshTime = 1000, cacheStorePlace = 'jsMemory' } = options
    // const { originalOption } = userParams
    const key = url satisfies ResourceUrl
    const shouldUseCache = await canUseCache({
      key,
      cacheFreshDuraction: (options?.cacheFreshTime ?? 1) * 1000,
      storePlace: cacheStorePlace,
    })
    if (shouldUseCache) {
      const content = getRecordedResponse({ key, storePlace: cacheStorePlace })!
      return content
    } else {
      const response = await next()
      if (isResponse(response) && response.ok) {
        recordResponse({ key, response, shelfLife: cacheFreshTime, storePlace: cacheStorePlace })
      }
      return response
    }
  }
}

interface JFetchCacheItem {
  /*
   * read .text() multi time will throw error, try to use rawText instead
   */
  responseBody?: ArrayBuffer // when it comes from localStorage, response is not exist
  responseInit?: ResponseInit
  ok?: boolean
  /** if undefined, it is always go through cache */
  expireAt?: number // seconds
}

const getResponseCache = (storePlace: 'jsMemory' | 'localStorage' | 'sessionStorage' | 'indexedDB') => {
  switch (storePlace) {
    case 'jsMemory':
      return createMemoryStoreManager<JFetchCacheItem>()
    case 'localStorage':
      return createLocalStorageStoreManager<JFetchCacheItem>()
    case 'sessionStorage':
      return createSessionStorageStoreManager<JFetchCacheItem>()
    case 'indexedDB':
      return createIndexedDBStoreManager<JFetchCacheItem>('jFetchCache', 'cache')
  }
}

/**
 * io-task: store the response content to use next time
 */
async function recordResponse(config: {
  key: string
  response: MayPromise<Response>
  shelfLife: number /* unit:s */
  storePlace: 'jsMemory' | 'localStorage' | 'sessionStorage' | 'indexedDB'
}) {
  const { key, response } = config
  return Promise.resolve(response).then((res) => {
    if (res.ok) {
      res
        .clone()
        .arrayBuffer()
        .then((buffer) => {
          // cach core
          getResponseCache(config.storePlace).set(key, {
            responseBody: buffer,
            responseInit: {
              status: res.status,
              statusText: res.statusText,
              headers: res.headers,
            },
            ok: true,
            expireAt: Date.now() / 1000 + config.shelfLife,
          })
        })
    }
    return res
  })
}
/**
 * io-task: get the response content from last time of {@link recordResponse}
 */
async function getRecordedResponse(config: {
  key: string
  storePlace: 'jsMemory' | 'localStorage' | 'sessionStorage' | 'indexedDB'
}): Promise<ArrayBuffer | undefined> {
  const { key } = config
  const responseCache = getResponseCache(config.storePlace)
  const cacheItem = await responseCache.get(key)
  if (cacheItem == null) return
  if (cacheItem.expireAt != null && isCurrentDateAfter(cacheItem.expireAt * 1000)) {
    responseCache.delete(key)
    return
  }
  return cacheItem.responseBody
}

async function canUseCache(config: {
  key: string
  cacheFreshDuraction?: number
  storePlace: 'jsMemory' | 'localStorage' | 'sessionStorage' | 'indexedDB'
}) {
  const responseCache = getResponseCache(config.storePlace)
  const hasCached = await responseCache.has(config.key)
  const isCacheFresh =
    config.cacheFreshDuraction != null
      ? Math.abs(Date.now() - ((await responseCache.get(config.key))!.expireAt ?? 0) * 1000) <
        config.cacheFreshDuraction * 1000
      : true
  return hasCached && isCacheFresh
}

async function isRequestSuccess(res: MayPromise<Response>) {
  const clonedRes = (await res).clone()
  if (!clonedRes.ok) return false
}
