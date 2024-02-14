import { isString } from '@edsolater/fnkit'

type JFetchResponseItem = Response | ArrayBuffer | undefined

export type JFetchMiddlewareItem = (
  ctx: { url: string; userParams?: { originalOption?: RequestInit } },
  next: () => Promise<JFetchResponseItem>,
) => Promise<JFetchResponseItem>

export interface JFetchMiddlewareOptions {
  middlewares?: JFetchMiddlewareItem[]
}

export async function jFetch<Shape = any>(
  input: RequestInfo,
  options?: JFetchMiddlewareOptions & { originalOption?: RequestInit },
): Promise<Shape | undefined> {
  const combinedTask = (options?.middlewares ?? []).reduce(
    (prev: () => Promise<JFetchResponseItem>, current) => async () =>
      current({ userParams: options, url: isString(input) ? input : input.url }, prev),
    () => fetch(input, options?.originalOption),
  )

  return combinedTask() as Promise<Shape | undefined>
}

export const isResponse = (res: unknown): res is Response => res instanceof Response
export function parseResponseInitConfig(res: Response): ResponseInit {
  return {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  }
}
export const isArrayBuffer = (res: unknown): res is ArrayBuffer => res instanceof ArrayBuffer
