import { AnyObj, MayArray, flapDeep, merge, shakeNil, shrinkFn } from '@edsolater/fnkit'
import { HTMLTag, LoadController, ValidController } from '../types/tools'
import { JSX } from 'solid-js'
import { objectMerge } from '../../fnkit/objectMerge'

export type HTMLProps<TagName extends HTMLTag = HTMLTag, Controller extends ValidController = {}> = MayArray<
  LoadController<JSX.IntrinsicElements[TagName] | undefined, Controller>
>
export function parseHTMLProps<Controller extends ValidController = {}>(
  htmlProps: HTMLProps,
  controller: Controller = {} as Controller
) {
  if (!htmlProps) return undefined
  return objectMerge(...shakeNil(flapDeep(htmlProps).map((i) => shrinkFn(i, [controller]))))
}

// TODO: moveToFnkit
export function mergeObjects<T extends AnyObj | undefined>(...objs: T[]): T {
  return Object.assign({}, ...objs)
}
