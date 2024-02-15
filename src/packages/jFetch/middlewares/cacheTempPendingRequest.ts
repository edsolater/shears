import { JFetchResponseItem, JFetchMiddlewareFn } from '../jFetch'

// store for on-going request to avoid duplicated request very fast.(100 times in 1ms)
const tempPendingRequest = new Map<string, Promise<JFetchResponseItem>>()
function hasTempPendingRequest(url: string) {
  return tempPendingRequest.has(url)
}
function getTempPendingRequest(url: string) {
  return tempPendingRequest.get(url)
}
/**
 * use {@link tempPendingRequest} to store on-going request
 * @param url key
 * @returns methods to load response(when loaded, it will be removed from {@link tempPendingRequest} also)
 */
function createTempPendingRequest(url: string) {
  let loadTempPendingRequest: (res: Promise<JFetchResponseItem>) => void = () => {} // Initialize the variable
  const tempPendingRequestPromise = new Promise<JFetchResponseItem>((resolve, reject) => {
    loadTempPendingRequest = (res) => {
      console.log('loadTempPendingRequest', res)
      res
        .then((res) => {
          resolve(res)
          tempPendingRequest.delete(url)
        })
        .catch((e) => {
          reject(e)
        })
        .finally(() => {
          console.log('🔞delete')
          tempPendingRequest.delete(url)
        })
    }
  })
  console.log('tempPendingRequestPromise: ', tempPendingRequestPromise)
  console.log('tempPendingRequest before set: ', tempPendingRequest)
  tempPendingRequest.set(url, tempPendingRequestPromise)
  console.log('tempPendingRequest after set: ', tempPendingRequest)
  return { loadTempPendingRequest }
}
export function middlewareUseTempPendingRequest(): JFetchMiddlewareFn {
  return async ({ url }, next) => {
    console.log('👾tempPendingRequest: ', url)
    if (hasTempPendingRequest(url)) {
      console.log('use temp cache')
      return getTempPendingRequest(url)?.then((res) => res?.clone())
    }
    const { loadTempPendingRequest } = createTempPendingRequest(url)
    const responsePromise = next()
    console.log('load')
    loadTempPendingRequest(responsePromise)
    return responsePromise
  }
}
