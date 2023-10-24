import { Accessor, createEffect, createMemo } from 'solid-js'
import { Accessify, deAccessify } from '../../packages/pivkit'
import { createLazyMemoFromObjectAccessor } from '../../packages/pivkit/hooks/createLazyMemoFromObjectAccessor'

/**
 * get url info
 * @param checkTargetUrl to be checked url
 * @returns
 */
export function useURL(checkTargetUrl: Accessor<string | undefined>) {
  const parsed = createMemo(() => {
    const _url = checkTargetUrl()
    console.log('_url: ', _url)
    return _url ? parseUrl(_url) : undefined
  })
  createEffect(() => {
    const _url = checkTargetUrl()
    console.log('_url2: ', _url)
    
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
  if (!URL.canParse(url)) return { isValid: false }
  const urlObj = new URL(url)
  return { isValid: true, ...urlObj }
}
