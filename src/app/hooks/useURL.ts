import { createEffect, createMemo } from 'solid-js'
import { Accessify, deAccessify } from '../../packages/pivkit'
import { createLazyMemoFromObjectAccessor } from '../../packages/pivkit/hooks/createLazyMemoFromObjectAccessor'

/**
 * get url info
 * @param checkTargetUrl to be checked url
 * @returns
 */
export function useURL(checkTargetUrl: Accessify<string | undefined>) {
  const url = createMemo(() => deAccessify(checkTargetUrl))
  const parsed = createMemo(() => {
    const _url = url()
    return _url ? parseUrl(_url) : undefined
  })

  const isValid = createLazyMemoFromObjectAccessor(parsed, (v) => v?.isValid)
  const origin = createLazyMemoFromObjectAccessor(parsed, (v) => v?.origin)
  const pathname = createLazyMemoFromObjectAccessor(parsed, (v) => v?.pathname)
  return { isValid, origin, pathname }
}
/**
 * utils
 */
function parseUrl(url: string): { isValid: boolean } & Partial<URL> {
  if (!URL.canParse(url)) return { isValid: false }
  const urlObj = new URL(url)
  return { isValid: true, ...urlObj }
}
