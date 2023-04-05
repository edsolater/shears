import { filter, flap, flapDeep, isObject, MayArray, mergeObjectsWithConfigs, shrinkFn } from '@edsolater/fnkit'
import { css, CSSObject } from '@emotion/css'
import { LoadController, ValidController } from '../types/tools'

export type ICSSObject<Controller extends ValidController = {}> = LoadController<CSSObject, Controller> // rename  for ICSSObject may be a superset of CSSObject

export type ICSS<Controller extends ValidController = {}> = MayArray<
  LoadController<boolean | string | number | null | undefined, Controller> | ICSSObject<Controller>
>

export function parseCSSToString<Controller extends ValidController = {}>(
  cssProp: ICSS<Controller>,
  controller: Controller = {} as Controller
) {
  const cssObjList = flapDeep(cssProp)
    .map((i) => shrinkFn(i, [controller]))
    .filter((i) => isObject(i)) as CSSObject[]
  if (!cssObjList.length) return ''
  const mergedCSSObj = cssObjList.reduce((acc, cur) => mergeCSSObject(acc, cur), {} as CSSObject)
  return css(mergedCSSObj)
}

// export function createICSS<T extends ICSS>(...icsses: T[]): T {
//   return icsses.length <= 1 ? icsses[0] : icsses.flat()
// }

export function compressICSSToObj<Controller extends ValidController = {}>(
  icss: ICSS<Controller>
): ICSSObject<Controller> {
  return (controller: Controller) => {
    const cssObjList = filter(
      flap(icss).map((i) => shrinkFn(i, [controller])),
      isObject
    ) as ICSSObject<Controller>[]
    const l = cssObjList.reduce((acc, cur) => mergeICSSObject<Controller>(acc, cur), {} as ICSSObject<Controller>)
    return shrinkFn(l, [controller])
  }
}
export function mergeICSSObject<Controller extends ValidController = {}>(
  ...icsses: ICSSObject<Controller>[]
): ICSSObject<Controller> {
  return (controller: Controller) =>
    mergeObjectsWithConfigs(
      icsses.map((ic) => shrinkFn(ic, [controller])),
      ({ valueA: v1, valueB: v2 }) => v2 ?? v1
    )
}
export function mergeCSSObject(...icsses: CSSObject[]): CSSObject {
  return mergeObjectsWithConfigs(icsses, ({ valueA: v1, valueB: v2 }) => v2 ?? v1)
}
