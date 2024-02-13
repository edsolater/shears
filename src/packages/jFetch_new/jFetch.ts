export type JFetchMiddlewareItem = (next: () => unknown) => void

export interface JFetchMiddlewareOptions {
  middlewares?: JFetchMiddlewareItem[]
}

/** see https://lxchuan12.gitee.io/koa-compose/#_3-1-%E6%AD%A3%E5%B8%B8%E6%B5%81%E7%A8%8B */
export async function jFetch<Shape = any>(
  input: RequestInfo,
  options?: JFetchMiddlewareOptions & { originalOption?: RequestInit },
): Promise<Shape | undefined> {
  const fetchCoreBodyAction = () => fetch(input, options?.originalOption)
  const combinedAction = (options?.middlewares ?? []).reduce((prev: () => unknown, current) => {
    return () => current(prev)
  }, fetchCoreBodyAction)
}
