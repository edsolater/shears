import { MayArray, flapDeep, merge, shakeNil, shrinkFn } from '@edsolater/fnkit';
import { LoadController, ValidController } from '../types/tools';
import { JSX } from 'solid-js';


export type IStyle<Controller extends ValidController = {}> = MayArray<
  LoadController<JSX.HTMLAttributes<any>['style'] | undefined, Controller>
>;
export function parseIStyles<Controller extends ValidController = {}>(
  styles: IStyle,
  controller: Controller = {} as Controller
) {
  if (!styles)
    return undefined;
  return merge(...shakeNil(flapDeep(styles).map((style) => shrinkFn(style, [controller]))));
}
