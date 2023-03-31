import { filter, flap, flapDeep, isObject, MayArray, mergeObjectsWithConfigs, shrinkToValue } from '@edsolater/fnkit'
import { css, CSSObject } from '@emotion/css'

export type ICSSObject = CSSObject // rename  for ICSSObject may be a superset of CSSObject

export type ICSS = MayArray<ICSSObject | boolean | string | number | null | undefined>

export function parseCSSToString(cssProp: ICSS) {
  const cssObjList = filter(flapDeep(cssProp), isObject)
  if (!cssObjList.length) return ''
  const mergedCSSObj = cssObjList.reduce((acc: CSSObject, cur) => mergeICSSObject(acc, shrinkToValue(cur)), {})
  return css(mergedCSSObj)
}

export function createICSS(...icsses: ICSS[]): ICSS {
  return icsses.length <= 1 ? icsses[0] : icsses.flat()
}

export function compressICSSToObj(icss: ICSS): ICSSObject {
  const cssObjList = filter(flap(icss), isObject) as ICSSObject[]
  return cssObjList.reduce((acc, cur) => mergeICSSObject(acc, cur), {} as ICSSObject)
}

export function mergeICSSObject(...icsses: ICSSObject[]): ICSSObject {
  return mergeObjectsWithConfigs(icsses, ({ valueA: v1, valueB: v2 }) => v2 ?? v1)
}
