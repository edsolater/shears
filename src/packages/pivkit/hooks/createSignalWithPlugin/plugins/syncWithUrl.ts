import { useSearchParams } from '@solidjs/router'
import { SignalPlugin } from '..'
import { Setter, createMemo } from 'solid-js'

export function syncWithUrl<T>(options: {
  urlKeyName: string
  fromUrl: (urlValue: string) => T
  toUrl: (value: T) => string
  /**
   * if not set, will set when the state is changed
   */
  whenSet?: (value: T) => void
}) {
  const [searchParams, setSearchParam] = useSearchParams()
  const valueFromUrl = createMemo(() => searchParams[options.urlKeyName])

  

  return {} satisfies SignalPlugin
}
