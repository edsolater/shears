import { JFetchMiddlewareFn } from '../jFetch'
import { isResponse } from '../utils/isResponse'

export function middlewareJsonify(): JFetchMiddlewareFn {
  return async ({ url }, next) => {
    const response = await next()
    if (isResponse(response)) return response.json()
    else return response
  }
}
