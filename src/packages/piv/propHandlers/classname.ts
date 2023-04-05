import { flap, isObjectLike, isTruthy, MayDeepArray, MayFn, shrinkFn } from '@edsolater/fnkit'
import { LoadController, ValidController } from '../types/tools'

export type ClassName<Controller extends ValidController = {}> = LoadController<
  any | { [classname: string]: LoadController<boolean, Controller> },
  Controller
>

export function classname<Controller extends ValidController = {}>(
  classNameArray: MayDeepArray<ClassName<Controller>>,
  controller?: Controller
) {
  return flap(classNameArray)
    .filter(isTruthy)
    .flatMap((classItemFn) => {
      const classItem = shrinkFn(classItemFn, [controller])
      return isObjectLike(classItem)
        ? Object.entries(classItem).map(([classString, condition]) => shrinkFn(condition, [controller]) && classString)
        : classItem
    })
    .join(' ')
}
