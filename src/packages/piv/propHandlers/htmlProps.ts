import { AnyObj, MayArray, flapDeep, isArray, shakeNil } from '@edsolater/fnkit'
import { JSX } from 'solid-js'
import { objectMerge } from '../../fnkit/objectMerge'
import { HTMLTag } from '../types/tools'

export type HTMLProps<TagName extends HTMLTag = HTMLTag> = MayArray<JSX.IntrinsicElements[TagName] | undefined>

/**
 * htmlProps can't have controller, because if this props be a function. there is no way to detect which props it will finnaly use
 */
export function parseHTMLProps(htmlProps: HTMLProps) {
  if (!htmlProps) return undefined
  return objectMerge(...shakeNil(flapDeep(htmlProps)))
}

// TODO: moveToFnkit
export function mergeObjects<T extends AnyObj | undefined>(...objs: T[]): T {
  return Object.assign({}, ...objs)
}

/**
 *
 * detect it related HTML attribute key
 * @todo has shadow props
 */
export function getHTMLPropsKeys(htmlProps: HTMLProps): string[] {
  if (!htmlProps) return []
  return isArray(htmlProps) ? htmlProps.map((i) => (i ? Object.keys(i) : [])).flat() : Object.keys(htmlProps)
}
