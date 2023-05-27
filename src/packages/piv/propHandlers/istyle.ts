import { MayArray, flapDeep, merge, shakeNil, shrinkFn } from '@edsolater/fnkit'
import { LoadController, ValidController } from '../types/tools'
import { JSX } from 'solid-js'
import { objectMerge } from '../../fnkit/objectMerge'

export type IStyle<Controller extends ValidController | unknown = unknown> = MayArray<
  LoadController<JSX.HTMLAttributes<any>['style'] | undefined, Controller>
>
export function parseIStyles<Controller extends ValidController | unknown = unknown>(
  styles: IStyle,
  controller: Controller = {} as Controller
): JSX.HTMLAttributes<any>['style'] | undefined {
  if (!styles) return undefined
  // @ts-expect-error no need to check
  return objectMerge(...shakeNil(flapDeep(styles).map((style) => shrinkFn(style, [controller]))))
}
