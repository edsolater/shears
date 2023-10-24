import { Accessor, createMemo } from 'solid-js'
import { createLazyMemoFromObjectAccessor } from '../../packages/pivkit/hooks/createLazyMemoFromObjectAccessor'

/**
 * get url info
 * @param checkTargetUrl to be checked url
 * @returns
 */
export function useURL(checkTargetUrl: Accessor<string | undefined>) {
  const parsed = createMemo(() => {
    const _url = checkTargetUrl()
    return _url ? parseUrl(_url) : undefined
  })

  const isValid = createMemo(() => parsed()?.isValid)
  const origin = createMemo(() => parsed()?.origin)
  const pathname = createLazyMemoFromObjectAccessor(parsed, (v) => v?.pathname)
  return { isValid, origin, pathname }
}
/**
 * utils
 */
function parseUrl(url: string): { isValid: boolean } & Partial<URL> {
  try {
    const urlObj = new URL(url)
    return { isValid: true, ...urlObj }
  } catch {
    return { isValid: false }
  }
}
